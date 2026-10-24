import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { formatRelativeTime } from '#/shared/lib/datetime'
import { Alias } from '#/shared/ui/alias'
import { Price } from '#/shared/ui/price'
import type { LotRoom, RoomBid } from '../api/room-api'

function BidRow({ bid, you, now }: { bid: RoomBid; you?: string; now: Date }) {
  const mine = you != null && bid.bidderAlias === you
  return (
    <li
      className={bid.pending ? 'grid gap-1 py-3 opacity-60' : 'grid gap-1 py-3'}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Alias value={bid.bidderAlias} />
          {mine && (
            <span className="text-xs font-medium text-primary">
              {m.lot_room_you()}
            </span>
          )}
          {bid.pending && (
            <span className="text-xs text-muted-foreground">
              {m.lot_room_pending()}
            </span>
          )}
        </div>
        <Price cents={bid.amountCents} className="font-medium text-gold-text" />
      </div>
      <p className="text-xs text-muted-foreground">
        {formatRelativeTime(bid.createdAt, getLocale(), now)}
      </p>
    </li>
  )
}

export function BidHistory({ room, now }: { room: LotRoom; now: Date }) {
  return (
    <section className="grid gap-3">
      <h2 className="font-display text-xl font-semibold">
        {m.lot_room_history()}
      </h2>
      {room.bids.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {m.lot_room_history_empty()}
        </p>
      ) : (
        <ol className="divide-y border-y">
          {room.bids.map((bid) => (
            <BidRow
              key={bid.pending ? 'pending' : bid.seq}
              bid={bid}
              you={room.viewer?.alias}
              now={now}
            />
          ))}
        </ol>
      )}
    </section>
  )
}
