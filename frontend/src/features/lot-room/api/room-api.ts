import { queryOptions } from '@tanstack/react-query'
import { api } from '#/shared/api/client'
import { ApiError } from '#/shared/api/api-error'
import { queryKeys } from '#/shared/api/query-keys'
import type { components } from '#/shared/api/schema'

export type RoomBid = components['schemas']['RoomBidDto'] & {
  pending?: boolean
}

export type LotRoom = Omit<components['schemas']['LotRoomDto'], 'bids'> & {
  bids: RoomBid[]
}

export type PlaceBidResult = components['schemas']['PlaceBidResultDto']

export async function fetchRoom(lotId: string): Promise<LotRoom> {
  const { data } = await api.GET('/lots/{id}', {
    params: { path: { id: lotId } },
  })
  if (!data) throw new ApiError(500, 'Empty response')
  return data
}

export async function placeBid(
  lotId: string,
  amountCents: number,
  idempotencyKey: string,
): Promise<PlaceBidResult> {
  const { data } = await api.POST('/lots/{id}/bids', {
    params: {
      path: { id: lotId },
      header: { 'Idempotency-Key': idempotencyKey },
    },
    body: { amountCents },
  })
  if (!data) throw new ApiError(500, 'Empty response')
  return data
}

export function roomQueryOptions(lotId: string) {
  return queryOptions({
    queryKey: queryKeys.lot(lotId),
    queryFn: () => fetchRoom(lotId),
  })
}
