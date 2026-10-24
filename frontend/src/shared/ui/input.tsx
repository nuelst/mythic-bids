import type { ComponentProps } from 'react'
import { cn } from '#/shared/lib/cn'
import { fieldControl } from './field-control'

function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(fieldControl, 'h-10 py-2', className)}
      {...props}
    />
  )
}

export { Input }
