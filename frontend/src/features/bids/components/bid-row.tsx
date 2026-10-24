import { Link } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'
import { Badge } from '#/shared/ui/badge'
import type { BadgeTone } from '#/shared/ui/badge'
import { CardImage } from '#/shared/ui/card-image'
import { Price } from '#/shared/ui/price'
import { RarityBadge } from '#/shared/ui/rarity-badge'
import { buttonVariants } from '#/shared/ui/button'
import type { BidOutcome, MyBid } from '../api/bids-api'

const OUTCOME = {
  WINNING: { tone: 'success' as const, label: m.bids_outcome_winning },
  OUTBID: { tone: 'warning' as const, label: m.bids_outcome_outbid },
  WON: { tone: 'gold' as const, label: m.bids_outcome_won },
  LOST: { tone: 'neutral' as const, label: m.bids_outcome_lost },
  CANCELLED: { tone: 'danger' as const, label: m.bids_outcome_cancelled },
} satisfies Record<BidOutcome, { tone: BadgeTone; label: () => string }>

function bidAmount(bid: MyBid) {
  if (bid.outcome === 'WON') {
    return (
      bid.lot.finalPriceCents ??
      bid.myHighestCents ??
      bid.lot.currentPriceCents ??
      bid.lot.startingPriceCents
    )
  }
  return bid.myHighestCents ?? bid.lot.startingPriceCents
}

export function BidRow({ bid }: { bid: MyBid }) {
  const amount = bidAmount(bid)
  return (
    <li className="flex flex-wrap items-center gap-4 py-4">
      <Link
        to="/lots/$lotId"
        params={{ lotId: bid.lot.id }}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <CardImage
          src={bid.lot.item.imageUrl}
          alt={bid.lot.item.name}
          className="w-14 shrink-0"
        />
        <span className="grid min-w-0 gap-1">
          <span className="font-display font-semibold">
            {bid.lot.item.name}
          </span>
          <span className="flex flex-wrap items-center gap-2">
            <RarityBadge rarity={bid.lot.item.rarity} />
            <Badge tone={OUTCOME[bid.outcome].tone}>
              {OUTCOME[bid.outcome].label()}
            </Badge>
          </span>
          <span className="text-sm text-muted-foreground">
            {m.bids_my_highest()}
          </span>
        </span>
      </Link>
      <Price cents={amount} className="text-lg font-semibold text-gold-text" />
      {bid.receiptToken && (
        <Link
          to="/receipts/$token"
          params={{ token: bid.receiptToken }}
          className={buttonVariants({ variant: 'secondary', size: 'sm' })}
        >
          {m.toast_view_receipt()}
        </Link>
      )}
    </li>
  )
}
