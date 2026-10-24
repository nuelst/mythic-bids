import { m } from '#/paraglide/messages'
import { cn } from '#/shared/lib/cn'
import { formatCountdown } from '#/shared/lib/datetime'
import { useNow } from '#/shared/lib/server-clock'

export const COUNTDOWN_WARNING_MS = 2 * 60 * 1000

function Countdown({
  endsAt,
  extended,
  className,
}: {
  endsAt: Date | string | number
  extended?: boolean
  className?: string
}) {
  const remaining = new Date(endsAt).getTime() - useNow().getTime()
  const label = formatCountdown(remaining) ?? m.countdown_ended()
  const warning = remaining > 0 && remaining <= COUNTDOWN_WARNING_MS

  return (
    <div className={cn('grid gap-1', className)}>
      <time
        dateTime={new Date(endsAt).toISOString()}
        aria-live="polite"
        className={cn(
          'tabular font-medium',
          remaining <= 0 && 'text-muted-foreground',
          warning && 'text-warning',
        )}
      >
        {label}
      </time>
      {extended && remaining > 0 && (
        <p className="text-xs text-warning">{m.countdown_extended()}</p>
      )}
    </div>
  )
}

export { Countdown }
