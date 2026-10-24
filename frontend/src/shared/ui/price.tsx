import { cn } from '#/shared/lib/cn'
import { formatCents } from '#/shared/lib/money'
import { getLocale } from '#/paraglide/runtime'

interface PriceProps {
  cents: number
  className?: string
}

/** BRL amount with tabular digits, so values do not shift while they change. */
function Price({ cents, className }: PriceProps) {
  return (
    <span className={cn('tabular whitespace-nowrap', className)}>
      {formatCents(cents, getLocale())}
    </span>
  )
}

export { Price }
