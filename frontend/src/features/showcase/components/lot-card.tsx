import { Link } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { formatDateTime } from '#/shared/lib/datetime'
import { Badge } from '#/shared/ui/badge'
import { Card, CardContent } from '#/shared/ui/card'
import { CardImage } from '#/shared/ui/card-image'
import { Countdown } from '#/shared/ui/countdown'
import { Price } from '#/shared/ui/price'
import { RarityBadge } from '#/shared/ui/rarity-badge'
import { displayPriceCents, isLiveLot } from '../api/lot-view'
import type { Lot } from '../api/showcase-api'

function PhaseBadge({ lot }: { lot: Lot }) {
  if (lot.sold) return <Badge tone="gold">{m.showcase_sold()}</Badge>
  if (lot.phase === 'LIVE') {
    return <Badge tone="success">{m.showcase_phase_live()}</Badge>
  }
  if (lot.phase === 'SCHEDULED') {
    return <Badge tone="info">{m.showcase_phase_scheduled()}</Badge>
  }
  if (lot.phase === 'CLOSING' || lot.phase === 'CLOSED') {
    return <Badge tone="neutral">{m.showcase_phase_closed()}</Badge>
  }
  return <Badge tone="danger">{m.showcase_phase_cancelled()}</Badge>
}

export function LotCard({ lot, priority }: { lot: Lot; priority?: boolean }) {
  return (
    <Link
      to="/lots/$lotId"
      params={{ lotId: lot.id }}
      className="block h-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="h-full overflow-hidden transition-colors hover:border-border-strong">
        <div className="p-4 pb-0">
          <CardImage
            src={lot.item.imageUrl}
            alt={lot.item.name}
            priority={priority}
          />
        </div>
        <CardContent className="grid gap-2 pt-4">
          <div className="flex flex-wrap gap-1.5">
            <RarityBadge rarity={lot.item.rarity} />
            <PhaseBadge lot={lot} />
          </div>
          <h2 className="font-display text-lg font-semibold leading-snug">
            {lot.item.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {lot.item.setName} · {lot.item.collectorNumber}
          </p>
          <Price
            cents={displayPriceCents(lot)}
            className="text-xl font-semibold text-gold-text"
          />
          {isLiveLot(lot) ? (
            <Countdown endsAt={lot.endsAt} extended={lot.extended} />
          ) : lot.phase === 'SCHEDULED' ? (
            <p className="text-sm text-muted-foreground">
              {m.showcase_starts({
                when: formatDateTime(lot.startsAt, getLocale()),
              })}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {m.countdown_ended()}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {m.showcase_bids({ count: lot.bidCount })}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
