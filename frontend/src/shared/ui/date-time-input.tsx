import { CalendarIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { useState } from 'react'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { cn } from '#/shared/lib/cn'
import {
  formatDateTime,
  fromDateTimeLocal,
  toDateTimeLocal,
} from '#/shared/lib/datetime'
import { Button } from './button'
import { Calendar } from './calendar'
import { fieldControl } from './field-control'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function timeFrom(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function merge(day: Date, time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const next = new Date(day)
  next.setHours(hours || 0, minutes || 0, 0, 0)
  return next
}

function DateTimeInput({
  id,
  value,
  onChange,
  onBlur,
  minDate,
  placeholder,
  allowEmpty,
  className,
  ...props
}: Omit<ComponentProps<'button'>, 'value' | 'onChange' | 'onBlur'> & {
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  minDate?: Date
  placeholder?: string
  allowEmpty?: boolean
}) {
  const [open, setOpen] = useState(false)
  const selected = fromDateTimeLocal(value ?? '')
  const time = selected ? timeFrom(selected) : timeFrom(minDate ?? new Date())
  const minDay = minDate
    ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
    : undefined

  function commit(day: Date, nextTime = time) {
    onChange?.(toDateTimeLocal(merge(day, nextTime)))
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) onBlur?.()
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="secondary"
          className={cn(
            fieldControl,
            'h-10 justify-start font-normal shadow-sm',
            !selected && 'text-subtle-foreground',
            className,
          )}
          {...props}
        >
          <CalendarIcon className="size-4 text-muted-foreground" aria-hidden />
          <span className="truncate">
            {selected
              ? formatDateTime(selected, getLocale())
              : (placeholder ?? m.datetime_pick())}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-3">
        <Calendar
          mode="single"
          selected={selected ?? undefined}
          onSelect={(day) => {
            if (!day) {
              if (allowEmpty) onChange?.('')
              return
            }
            commit(day)
          }}
          disabled={minDay ? { before: minDay } : undefined}
          defaultMonth={selected ?? minDate}
        />
        <div className="mt-3 grid gap-3 border-t pt-3">
          <label className="grid gap-2">
            <span className="text-sm font-medium">{m.datetime_time()}</span>
            <Input
              type="time"
              value={time}
              onChange={(event) => {
                commit(selected ?? minDate ?? new Date(), event.target.value)
              }}
              className="tabular"
            />
          </label>
          {allowEmpty && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-self-start"
              onClick={() => {
                onChange?.('')
                setOpen(false)
                onBlur?.()
              }}
            >
              {m.datetime_now()}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DateTimeInput }
