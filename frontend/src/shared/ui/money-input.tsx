import type { ComponentProps } from 'react'
import { cn } from '#/shared/lib/cn'
import { formatCentsPlain, parseCents } from '#/shared/lib/money'
import { getLocale } from '#/paraglide/runtime'
import { fieldControl } from './field-control'

type MoneyInputProps = Omit<
  ComponentProps<'input'>,
  'value' | 'onChange' | 'type'
> & {
  /** Value in cents. */
  value: number | null
  onChange: (cents: number | null) => void
}

/**
 * Banking-app style input: typed digits fill the amount from the cents up ("1" → 0,01),
 * so the value is always a valid amount and never ambiguous about decimal separators.
 */
function MoneyInput({ value, onChange, className, ...props }: MoneyInputProps) {
  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground"
      >
        R$
      </span>
      <input
        {...props}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        data-slot="money-input"
        value={value === null ? '' : formatCentsPlain(value, getLocale())}
        onChange={(event) => onChange(parseCents(event.target.value))}
        className={cn(
          fieldControl,
          'tabular h-10 py-2 pl-10 text-right',
          className,
        )}
      />
    </div>
  )
}

export { MoneyInput }
