import { Link } from '@tanstack/react-router'
import { AlertCircle, SearchX } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { formatCents } from '#/shared/lib/money'
import { BackLink } from '#/shared/ui/back-link'
import { Badge } from '#/shared/ui/badge'
import { Button, buttonVariants } from '#/shared/ui/button'
import { CardImage } from '#/shared/ui/card-image'
import { Countdown } from '#/shared/ui/countdown'
import { EmptyState } from '#/shared/ui/empty-state'
import { Price } from '#/shared/ui/price'
import { RarityBadge } from '#/shared/ui/rarity-badge'
import { Skeleton } from '#/shared/ui/skeleton'
import { BidHistory } from '../components/bid-history'
import { LotStatus } from '../components/lot-status'
import { StandingBanner } from '../components/standing-banner'
import { displayRoomPriceCents } from '../api/room-events'
import { useLotRoom } from '../view-models/use-lot-room'

const PHASE_BADGE = {
  LIVE: { tone: 'success' as const, label: m.showcase_phase_live },
  SCHEDULED: { tone: 'info' as const, label: m.showcase_phase_scheduled },
  CLOSING: { tone: 'warning' as const, label: m.lot_room_closing_badge },
  CLOSED: { tone: 'neutral' as const, label: m.showcase_phase_closed },
  CANCELLED: { tone: 'danger' as const, label: m.showcase_phase_cancelled },
}

function priceLabel(
  phase: 'SCHEDULED' | 'LIVE' | 'CLOSING' | 'CLOSED' | 'CANCELLED',
) {
  if (phase === 'CLOSED' || phase === 'CLOSING') return m.lot_room_final_price()
  if (phase === 'SCHEDULED') return m.lot_room_starting_price()
  return m.lot_room_current_price()
}

function RoomSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_1fr]">
      <Skeleton className="aspect-[63/88] rounded-xl" />
      <div className="grid gap-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}

export function LotRoomPage({ lotId }: { lotId: string }) {
  const roomState = useLotRoom(lotId)

  if (roomState.isNotFound) {
    return (
      <main className="container-page py-10">
        <EmptyState
          icon={SearchX}
          title={m.error_lot_not_found()}
          description={m.lot_room_not_found_hint()}
          action={
            <Link
              to="/"
              search={{}}
              className={buttonVariants({ variant: 'secondary' })}
            >
              {m.lot_room_back()}
            </Link>
          }
        />
      </main>
    )
  }

  if (roomState.isError && !roomState.room) {
    return (
      <main className="container-page py-10">
        <EmptyState
          icon={AlertCircle}
          title={m.lot_room_error()}
          description={m.showcase_error_hint()}
          action={
            <Button
              variant="secondary"
              onClick={() => void roomState.refetch()}
            >
              {m.showcase_retry()}
            </Button>
          }
        />
      </main>
    )
  }

  const room = roomState.room

  return (
    <main className="container-page grid gap-10 py-10">
      <BackLink to="/" label={m.lot_room_back()} />

      {roomState.isPending || !room ? (
        <RoomSkeleton />
      ) : (
        <>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-start">
            <CardImage src={room.item.imageUrl} alt={room.item.name} priority />
            <div className="grid gap-5">
              <div className="flex flex-wrap gap-1.5">
                <RarityBadge rarity={room.item.rarity} />
                <Badge tone={PHASE_BADGE[room.phase].tone}>
                  {room.sold
                    ? m.showcase_sold()
                    : PHASE_BADGE[room.phase].label()}
                </Badge>
              </div>
              <div className="grid gap-1">
                <h1 className="font-display text-4xl font-bold">
                  {room.item.name}
                </h1>
                {room.item.typeLine && (
                  <p className="text-muted-foreground">{room.item.typeLine}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {room.item.setName} · {room.item.collectorNumber}
                </p>
              </div>
              <div className="grid gap-1">
                <p className="text-sm text-muted-foreground">
                  {priceLabel(room.phase)}
                </p>
                <p aria-live="polite">
                  <Price
                    cents={displayRoomPriceCents(room)}
                    className="text-4xl font-semibold text-gold-text"
                  />
                </p>
                <p className="text-sm text-muted-foreground">
                  {m.lot_room_increment({
                    amount: formatCents(room.minIncrementCents, getLocale()),
                  })}
                  {' · '}
                  {m.showcase_bids({ count: room.bidCount })}
                </p>
              </div>
              {(room.phase === 'LIVE' || room.phase === 'CLOSING') && (
                <Countdown endsAt={room.endsAt} extended={room.extended} />
              )}
              <StandingBanner room={room} />
              <LotStatus
                room={room}
                isLive={roomState.isLive}
                isBidder={roomState.isBidder}
                isGuest={roomState.isGuest}
              />
            </div>
          </div>
          <BidHistory room={room} now={roomState.now} />
        </>
      )}
    </main>
  )
}
