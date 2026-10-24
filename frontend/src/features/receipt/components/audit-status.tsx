import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { formatDateTime } from '#/shared/lib/datetime'
import { Badge } from '#/shared/ui/badge'
import { auditIssueText } from '../api/receipt-view'
import type { AuditReport } from '../api/receipt-api'

export function AuditStatus({ report }: { report: AuditReport }) {
  const intact = report.intact
  const Icon = intact ? ShieldCheck : ShieldAlert
  return (
    <div
      role="status"
      className={
        intact
          ? 'grid gap-2 rounded-lg border border-success/30 bg-success/10 p-4'
          : 'grid gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4'
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Icon
          className={intact ? 'size-5 text-success' : 'size-5 text-danger'}
          aria-hidden
        />
        <Badge tone={intact ? 'success' : 'danger'}>
          {intact ? m.audit_intact() : m.audit_tampered()}
        </Badge>
      </div>
      <p className={intact ? 'text-sm text-success' : 'text-sm text-danger'}>
        {intact
          ? m.audit_intact_hint()
          : m.audit_tampered_hint({ count: report.issues.length })}
      </p>
      {!intact && report.issues.length > 0 && (
        <ul className="grid gap-1 text-sm text-danger">
          {report.issues.map((issue, index) => (
            <li key={`${issue.code}-${issue.seq ?? index}`}>
              {auditIssueText(issue)}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">
        {m.audit_checked({
          when: formatDateTime(report.checkedAt, getLocale()),
        })}
      </p>
    </div>
  )
}
