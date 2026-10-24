import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '#/shared/lib/cn'

// Soft badges: tinted background with AA-contrast text of the same hue.
const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&>svg]:size-3',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-muted text-muted-foreground',
        primary: 'border-primary/20 bg-primary-soft text-primary',
        gold: 'border-gold/30 bg-gold/15 text-gold-text',
        success: 'border-success/25 bg-success/10 text-success',
        warning: 'border-warning/25 bg-warning/10 text-warning',
        danger: 'border-danger/25 bg-danger/10 text-danger',
        info: 'border-info/25 bg-info/10 text-info',
        common:
          'border-rarity-common/25 bg-rarity-common/10 text-rarity-common',
        uncommon:
          'border-rarity-uncommon/25 bg-rarity-uncommon/10 text-rarity-uncommon',
        rare: 'border-rarity-rare/30 bg-rarity-rare/10 text-rarity-rare',
        mythic:
          'border-rarity-mythic/30 bg-rarity-mythic/10 text-rarity-mythic',
        special:
          'border-rarity-special/25 bg-rarity-special/10 text-rarity-special',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>

function Badge({
  className,
  tone,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
export type { BadgeTone }
