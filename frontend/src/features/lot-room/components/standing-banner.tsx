import { m } from '#/paraglide/messages'
import { cn } from '#/shared/lib/cn'
import type { LotRoom } from '../api/room-api'

export function StandingBanner({ room }: { room: LotRoom }) {
  const viewer = room.viewer
  if (!viewer) return null

  const leading = viewer.isLeading
  const hasBid = viewer.position != null

  return (
    <p
      aria-live="polite"
      className={cn(
        'rounded-md px-3 py-2 text-sm font-medium',
        leading && 'bg-success/10 text-success',
        hasBid && !leading && 'bg-warning/10 text-warning',
        !hasBid && 'bg-muted text-muted-foreground',
      )}
    >
      {!hasBid
        ? m.lot_room_not_bid()
        : leading
          ? m.lot_room_leading()
          : `${m.lot_room_outbid()} · ${m.lot_room_position({
              position: viewer.position ?? 0,
              bidders: viewer.bidders,
            })}`}
    </p>
  )
}
