import { Link } from '@tanstack/react-router'
import { Receipt } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { cn } from '#/shared/lib/cn'
import { formatDateTime } from '#/shared/lib/datetime'
import { EmptyState } from '#/shared/ui/empty-state'
import { Pagination } from '#/shared/ui/pagination'
import { Price } from '#/shared/ui/price'
import { Skeleton } from '#/shared/ui/skeleton'
import type {
  LedgerEntry,
  LedgerEntryType,
  LedgerPage,
} from '../api/wallet-api'

const TYPE_LABEL = {
  DEPOSIT: m.ledger_deposit,
  HOLD: m.ledger_hold,
  RELEASE: m.ledger_release,
  CAPTURE: m.ledger_capture,
  PAYOUT: m.ledger_payout,
  REFUND: m.ledger_refund,
} satisfies Record<LedgerEntryType, () => string>

const OUTGOING = new Set<LedgerEntryType>(['HOLD', 'CAPTURE'])

function LedgerRow({ entry }: { entry: LedgerEntry }) {
  const outgoing = OUTGOING.has(entry.type)
  return (
    <li className="flex flex-wrap items-baseline justify-between gap-3 py-3">
      <div className="grid min-w-0 gap-1">
        <p className="font-medium">{TYPE_LABEL[entry.type]()}</p>
        <p className="text-xs text-muted-foreground">
          {formatDateTime(entry.createdAt, getLocale())}
          {entry.lotId && (
            <>
              {' · '}
              <Link
                to="/lots/$lotId"
                params={{ lotId: entry.lotId }}
                className="hover:text-foreground hover:underline"
              >
                {m.wallet_view_lot()}
              </Link>
            </>
          )}
        </p>
      </div>
      <span
        className={cn(
          'flex items-baseline gap-1 font-medium',
          outgoing ? 'text-danger' : 'text-success',
        )}
      >
        <span aria-hidden>{outgoing ? '−' : '+'}</span>
        <Price cents={entry.amountCents} />
      </span>
    </li>
  )
}

export function LedgerList({
  ledger,
  onPageChange,
}: {
  ledger?: LedgerPage
  onPageChange: (page: number) => void
}) {
  if (!ledger) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (ledger.items.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title={m.wallet_ledger_empty()}
        description={m.wallet_ledger_empty_hint()}
      />
    )
  }

  return (
    <div className="grid gap-6">
      <ol className="divide-y border-y">
        {ledger.items.map((entry) => (
          <LedgerRow key={entry.id} entry={entry} />
        ))}
      </ol>
      <Pagination
        page={ledger.page}
        pageSize={ledger.pageSize}
        total={ledger.total}
        onPageChange={onPageChange}
      />
    </div>
  )
}
