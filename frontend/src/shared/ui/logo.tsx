import { cn } from '#/shared/lib/cn'

/** Faceted gem mark + wordmark. */
function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden>
        <path d="M16 2 29 12 16 30 3 12Z" className="fill-primary" />
        <path d="M16 2 22 12H10Z" className="fill-primary-foreground/25" />
        <path d="M3 12h26L16 30Z" className="fill-foreground/10" />
        <path d="M10 12h12l-6 18Z" className="fill-gold/70" />
      </svg>
      <span className="font-display text-xl font-semibold tracking-tight">
        Mythic <span className="text-gold-text">Bids</span>
      </span>
    </span>
  )
}

export { Logo }
