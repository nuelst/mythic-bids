import { createFileRoute } from '@tanstack/react-router'
import { LotRoomPage } from '#/features/lot-room/pages/lot-room-page'
import { roomQueryOptions } from '#/features/lot-room/api/room-api'

export const Route = createFileRoute('/lots/$lotId')({
  loader: ({ context, params }) =>
    context.queryClient.prefetchQuery(roomQueryOptions(params.lotId)),
  component: LotRoomRoute,
})

function LotRoomRoute() {
  const { lotId } = Route.useParams()
  return <LotRoomPage lotId={lotId} />
}
