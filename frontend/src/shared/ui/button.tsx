import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '#/shared/lib/cn'

const buttonVariants = cva(
  'inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap outline-none ' +
    'transition-[color,background-color,box-shadow,transform] duration-150 ease-out ' +
    'motion-safe:active:scale-[1.04] motion-safe:active:shadow-md ' +
    'disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 ' +
    'focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
    'aria-busy:cursor-progress [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover',
        secondary:
          'border border-border-strong bg-surface text-foreground shadow-sm hover:bg-muted',
        ghost: 'text-foreground hover:bg-muted',
        danger:
          'bg-danger text-primary-foreground shadow-sm hover:bg-danger/90',
        link: 'h-auto px-0 text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'size-10',
        'icon-sm': 'size-8',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /** Shows a spinner and blocks repeated clicks while an action runs. */
    loading?: boolean
  }

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && !asChild && <Loader2 className="animate-spin" aria-hidden />}
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
