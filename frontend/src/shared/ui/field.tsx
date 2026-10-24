import { Slot } from 'radix-ui'
import type { ReactNode } from 'react'
import { cn } from '#/shared/lib/cn'
import { Label } from './label'

interface FieldProps {
  id: string
  label: ReactNode
  description?: ReactNode
  error?: string
  className?: string
  /** A single control; it receives id, aria-invalid and aria-describedby. */
  children: ReactNode
}

/** Label, hint and error wired to the control, so screen readers announce all of them. */
function Field({
  id,
  label,
  description,
  error,
  className,
  children,
}: FieldProps) {
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Slot.Root
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(descriptionId, errorId) || undefined}
      >
        {children}
      </Slot.Root>
      {description && !error && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}
    </div>
  )
}

export { Field }
