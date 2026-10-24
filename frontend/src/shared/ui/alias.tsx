import { cn } from '#/shared/lib/cn'

/** Bidder pseudonym (e.g. B-3FA9C1D2), the only way bidders are shown publicly. */
function Alias({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        'rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground',
        className,
      )}
    >
      {value}
    </span>
  )
}

export { Alias }
