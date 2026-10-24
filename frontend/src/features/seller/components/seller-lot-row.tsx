import { Link } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { formatCents } from '#/shared/lib/money'
import { Badge } from '#/shared/ui/badge'
import { Button } from '#/shared/ui/button'
import { CardImage } from '#/shared/ui/card-image'
import { Price } from '#/shared/ui/price'
import { RarityBadge } from '#/shared/ui/rarity-badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/shared/ui/alert-dialog'
import { canCancel } from '../api/seller-api'
import type { Lot } from '../api/seller-api'

const PHASE = {
  LIVE: { tone: 'success' as const, label: m.showcase_phase_live },
  SCHEDULED: { tone: 'info' as const, label: m.showcase_phase_scheduled },
  CLOSING: { tone: 'warning' as const, label: m.lot_room_closing_badge },
  CLOSED: { tone: 'neutral' as const, label: m.showcase_phase_closed },
  CANCELLED: { tone: 'danger' as const, label: m.showcase_phase_cancelled },
}

function lotPrice(lot: Lot) {
  if (lot.sold)
    return (
      lot.finalPriceCents ?? lot.currentPriceCents ?? lot.startingPriceCents
    )
  return lot.currentPriceCents ?? lot.startingPriceCents
}

export function SellerLotRow({
  lot,
  onCancel,
  cancelling,
}: {
  lot: Lot
  onCancel: (lotId: string) => void
  cancelling: boolean
}) {
  const refund = lot.currentPriceCents
  return (
    <li className="flex flex-wrap items-center gap-4 border-b py-4">
      <Link
        to="/lots/$lotId"
        params={{ lotId: lot.id }}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <CardImage
          src={lot.item.imageUrl}
          alt={lot.item.name}
          className="w-14 shrink-0"
        />
        <span className="grid min-w-0 gap-1">
          <span className="font-display font-semibold">{lot.item.name}</span>
          <span className="flex flex-wrap items-center gap-2">
            <RarityBadge rarity={lot.item.rarity} />
            <Badge tone={PHASE[lot.phase].tone}>
              {lot.sold ? m.showcase_sold() : PHASE[lot.phase].label()}
            </Badge>
          </span>
          <span className="text-sm text-muted-foreground">
            {m.showcase_bids({ count: lot.bidCount })}
          </span>
        </span>
      </Link>
      <Price
        cents={lotPrice(lot)}
        className="text-lg font-semibold text-gold-text"
      />
      {canCancel(lot) && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="danger" size="sm" disabled={cancelling}>
              {m.seller_cancel()}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{m.seller_cancel_title()}</AlertDialogTitle>
              <AlertDialogDescription>
                {refund
                  ? m.seller_cancel_refund({
                      amount: formatCents(refund, getLocale()),
                    })
                  : m.seller_cancel_empty()}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{m.close()}</AlertDialogCancel>
              <AlertDialogAction
                variant="danger"
                onClick={() => onCancel(lot.id)}
              >
                {m.seller_cancel()}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </li>
  )
}
