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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/shared/ui/table'
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
    <TableRow>
      <TableCell className="font-medium">{TYPE_LABEL[entry.type]()}</TableCell>
      <TableCell className="text-muted-foreground whitespace-nowrap">
        {formatDateTime(entry.createdAt, getLocale())}
      </TableCell>
      <TableCell>
        {entry.lotId ? (
          <Link
            to="/lots/$lotId"
            params={{ lotId: entry.lotId }}
            className="hover:text-foreground hover:underline"
          >
            {m.wallet_view_lot()}
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell
        className={cn(
          'text-right font-medium whitespace-nowrap',
          outgoing ? 'text-danger' : 'text-success',
        )}
      >
        <span aria-hidden>{outgoing ? '−' : '+'}</span>
        <Price cents={entry.amountCents} />
      </TableCell>
    </TableRow>
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
          <Skeleton key={index} className="h-12 w-full" />
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{m.wallet_ledger_type()}</TableHead>
            <TableHead>{m.wallet_ledger_when()}</TableHead>
            <TableHead>{m.wallet_ledger_lot()}</TableHead>
            <TableHead className="text-right">
              {m.wallet_ledger_amount()}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ledger.items.map((entry) => (
            <LedgerRow key={entry.id} entry={entry} />
          ))}
        </TableBody>
      </Table>
      <Pagination
        page={ledger.page}
        pageSize={ledger.pageSize}
        total={ledger.total}
        onPageChange={onPageChange}
      />
    </div>
  )
}
