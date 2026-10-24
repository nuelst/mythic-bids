import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Badge } from '#/shared/ui/badge'

export function ReceiptSeal({ valid }: { valid: boolean }) {
  const Icon = valid ? ShieldCheck : ShieldAlert
  return (
    <div
      role="status"
      className={
        valid
          ? 'grid gap-2 rounded-lg border border-success/30 bg-success/10 p-4'
          : 'grid gap-2 rounded-lg border border-danger/30 bg-danger/10 p-4'
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Icon
          className={valid ? 'size-5 text-success' : 'size-5 text-danger'}
          aria-hidden
        />
        <Badge tone={valid ? 'success' : 'danger'}>
          {valid ? m.receipt_seal_valid() : m.receipt_seal_invalid()}
        </Badge>
      </div>
      <p className={valid ? 'text-sm text-success' : 'text-sm text-danger'}>
        {valid ? m.receipt_seal_valid_hint() : m.receipt_seal_invalid_hint()}
      </p>
    </div>
  )
}
