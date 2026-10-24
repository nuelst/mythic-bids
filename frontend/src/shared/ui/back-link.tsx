import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { cn } from '#/shared/lib/cn'
import { buttonVariants } from './button'

function BackLink({
  to,
  label,
  className,
}: {
  to: '/' | '/seller'
  label: string
  className?: string
}) {
  return (
    <Link
      to={to}
      search={{}}
      aria-label={label}
      title={label}
      className={cn(
        buttonVariants({ variant: 'ghost', size: 'sm' }),
        '-ml-2 w-fit justify-self-start',
        className,
      )}
    >
      <ChevronLeft />
      {m.back()}
    </Link>
  )
}

export { BackLink }
