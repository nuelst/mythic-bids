import type { ComponentProps } from 'react'
import { cn } from '#/shared/lib/cn'
import { fieldControl } from './field-control'

/** Native date-time picker (accessible and localized by the browser), in the design system look. */
function DateTimeInput({
  className,
  ...props
}: Omit<ComponentProps<'input'>, 'type'>) {
  return (
    <input
      type="datetime-local"
      data-slot="date-time-input"
      className={cn(fieldControl, 'tabular h-10 py-2', className)}
      {...props}
    />
  )
}

export { DateTimeInput }
