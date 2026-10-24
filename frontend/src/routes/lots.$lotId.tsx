import { createFileRoute } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/lots/$lotId')({
  ssr: false,
  component: LotRoomPlaceholder,
})

function LotRoomPlaceholder() {
  const { lotId } = Route.useParams()
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold">
        {m.lot_room_title()}
      </h1>
      <p className="mt-2 font-mono text-sm text-muted-foreground">{lotId}</p>
    </main>
  )
}
