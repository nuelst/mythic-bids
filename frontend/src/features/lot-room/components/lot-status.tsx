import { Link } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { formatDateTime } from '#/shared/lib/datetime'
import { formatCents } from '#/shared/lib/money'
import { Alias } from '#/shared/ui/alias'
import { buttonVariants } from '#/shared/ui/button'
import type { LotRoom } from '../api/room-api'
import { BidForm } from './bid-form'

export function LotStatus({
  room,
  isLive,
  isBidder,
  isGuest,
}: {
  room: LotRoom
  isLive: boolean
  isBidder: boolean
  isGuest: boolean
}) {
  if (room.phase === 'CANCELLED') {
    return <p className="text-sm text-danger">{m.lot_room_cancelled()}</p>
  }

  if (room.phase === 'SCHEDULED') {
    return (
      <p className="text-sm text-muted-foreground">
        {m.lot_room_scheduled()}{' '}
        {m.showcase_starts({
          when: formatDateTime(room.startsAt, getLocale()),
        })}
      </p>
    )
  }

  if (room.phase === 'CLOSING') {
    return (
      <p className="text-sm text-muted-foreground">{m.lot_room_closing()}</p>
    )
  }

  if (room.phase === 'CLOSED') {
    if (!room.sold) {
      return (
        <p className="text-sm text-muted-foreground">
          {m.lot_room_closed_unsold()}
        </p>
      )
    }
    const amount = formatCents(
      room.finalPriceCents ?? room.currentPriceCents ?? room.startingPriceCents,
      getLocale(),
    )
    return (
      <div className="grid gap-3">
        <p className="text-sm">
          {m.lot_room_closed_sold({
            alias: room.leaderAlias ?? '—',
            amount,
          })}
        </p>
        {room.leaderAlias && (
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {m.lot_room_winner()}
            <Alias value={room.leaderAlias} />
          </p>
        )}
        {room.viewer?.isLeading && (
          <Link
            to="/me/bids"
            search={{}}
            className={buttonVariants({ variant: 'secondary', size: 'sm' })}
          >
            {m.lot_room_my_bids()}
          </Link>
        )}
      </div>
    )
  }

  if (isLive && isBidder) return <BidForm room={room} />

  if (isLive && isGuest) {
    return (
      <div className="grid gap-3">
        <p className="text-sm text-muted-foreground">
          {m.lot_room_login_hint()}
        </p>
        <Link
          to="/login"
          search={{ redirect: `/lots/${room.id}` }}
          className={buttonVariants({ size: 'sm' })}
        >
          {m.lot_room_login()}
        </Link>
      </div>
    )
  }

  if (isLive) {
    return (
      <p className="text-sm text-muted-foreground">{m.lot_room_auctioneer()}</p>
    )
  }

  return null
}
