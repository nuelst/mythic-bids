import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { isApiError } from '#/shared/api/api-error'
import { queryKeys } from '#/shared/api/query-keys'
import { useSession } from '#/shared/auth/use-session'
import { API_URL } from '#/shared/lib/env'
import { setServerTime, useNow } from '#/shared/lib/server-clock'
import { useEventStream } from '#/shared/lib/sse'
import { roomQueryOptions } from '../api/room-api'
import type { LotRoom } from '../api/room-api'
import {
  applyBidPlaced,
  applyLotCancelled,
  applyLotClosed,
  parseBidPlaced,
  parseLotClosed,
} from '../api/room-events'

function eventsUrl(lotId: string) {
  return `${API_URL}/lots/${lotId}/events`
}

function patchRoom(
  queryClient: ReturnType<typeof useQueryClient>,
  lotId: string,
  updater: (room: LotRoom) => LotRoom,
) {
  queryClient.setQueryData<LotRoom>(queryKeys.lot(lotId), (current) =>
    current ? updater(current) : current,
  )
}

export function useLotRoom(lotId: string) {
  const session = useSession()
  const queryClient = useQueryClient()
  const now = useNow()
  const token = session?.accessToken ?? null
  const previousToken = useRef(token)

  const result = useQuery({
    ...roomQueryOptions(lotId),
    retry: (count, error) => {
      if (isApiError(error) && error.status === 404) return false
      return count < 1
    },
  })

  useEffect(() => {
    if (result.data?.serverTime) setServerTime(result.data.serverTime)
  }, [result.data?.serverTime])

  useEffect(() => {
    if (previousToken.current === token) return
    previousToken.current = token
    void queryClient.invalidateQueries({ queryKey: queryKeys.lot(lotId) })
  }, [token, lotId, queryClient])

  useEventStream(
    lotId ? eventsUrl(lotId) : null,
    {
      'bid.placed': (data) => {
        const payload = parseBidPlaced(data)
        if (!payload) return
        patchRoom(queryClient, lotId, (room) => applyBidPlaced(room, payload))
      },
      'lot.closed': (data) => {
        const payload = parseLotClosed(data)
        if (!payload) return
        patchRoom(queryClient, lotId, (room) => applyLotClosed(room, payload))
      },
      'lot.cancelled': () => {
        patchRoom(queryClient, lotId, applyLotCancelled)
      },
    },
    {
      onOpen: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.lot(lotId) })
      },
    },
  )

  const room = result.data
  const remainingMs = room ? new Date(room.endsAt).getTime() - now.getTime() : 0

  return {
    room,
    now,
    isPending: result.isPending,
    isError: result.isError,
    isNotFound: isApiError(result.error) && result.error.status === 404,
    refetch: result.refetch,
    role: session?.user.role,
    isBidder: session?.user.role === 'BIDDER',
    isGuest: !session,
    isLive: room?.phase === 'LIVE' && remainingMs > 0,
  }
}
