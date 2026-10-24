import { DayPicker } from 'react-day-picker'
import type { ComponentProps, CSSProperties } from 'react'
import { enUS, pt } from 'react-day-picker/locale'
import { getLocale } from '#/paraglide/runtime'
import 'react-day-picker/style.css'

function Calendar({
  className,
  style,
  ...props
}: ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={getLocale() === 'pt' ? pt : enUS}
      className={className}
      style={
        {
          '--rdp-accent-color': 'var(--primary)',
          '--rdp-accent-background-color': 'var(--primary-soft)',
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  )
}

export { Calendar }
