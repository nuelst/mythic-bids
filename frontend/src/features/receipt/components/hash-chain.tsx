import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { formatCents } from '#/shared/lib/money'
import { Alias } from '#/shared/ui/alias'
import { CopyButton } from '#/shared/ui/copy-button'
import { shortHash } from '../api/receipt-view'
import type { AuditReport } from '../api/receipt-api'

function HashRow({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail?: string
}) {
  return (
    <li className="grid gap-1 border-b py-3 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </div>
      <div className="flex items-center gap-1">
        <code
          title={value}
          className="min-w-0 truncate font-mono text-xs text-muted-foreground"
        >
          {shortHash(value)}
        </code>
        <CopyButton value={value} label={m.audit_hash()} />
      </div>
    </li>
  )
}

export function HashChain({ report }: { report: AuditReport }) {
  return (
    <ol>
      <HashRow label={m.audit_genesis()} value={report.terms.genesisHash} />
      {report.bids.map((bid) => (
        <li key={bid.seq} className="grid gap-2 border-b py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {m.audit_bid({ seq: bid.seq })}
            </p>
            <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Alias value={bid.bidderAlias} />
              {formatCents(bid.amountCents, getLocale())}
            </span>
          </div>
          <div className="grid gap-1">
            <div className="flex items-center gap-1">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">
                {m.audit_prev()}
              </span>
              <code
                title={bid.prevHash}
                className="min-w-0 truncate font-mono text-xs text-muted-foreground"
              >
                {shortHash(bid.prevHash)}
              </code>
              <CopyButton value={bid.prevHash} label={m.audit_prev()} />
            </div>
            <div className="flex items-center gap-1">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">
                {m.audit_hash()}
              </span>
              <code
                title={bid.hash}
                className="min-w-0 truncate font-mono text-xs text-muted-foreground"
              >
                {shortHash(bid.hash)}
              </code>
              <CopyButton value={bid.hash} label={m.audit_hash()} />
            </div>
          </div>
        </li>
      ))}
      {report.seal && (
        <HashRow
          label={m.audit_seal()}
          value={report.seal.finalHash}
          detail={report.seal.winnerAlias}
        />
      )}
    </ol>
  )
}
