import type { ComponentProps } from 'react'
import { cn } from '#/shared/lib/cn'
import { fieldControl } from './field-control'

function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        fieldControl,
        'field-sizing-content min-h-20 py-2',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
