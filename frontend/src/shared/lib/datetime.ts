import { intlLocale } from './intl-locale'

type DateInput = Date | string | number

function asDate(value: DateInput) {
  return value instanceof Date ? value : new Date(value)
}

export function formatDateTime(value: DateInput, locale: string) {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(asDate(value))
}

export function formatDate(value: DateInput, locale: string) {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: 'medium',
  }).format(asDate(value))
}

const RELATIVE_DIVISIONS = [
  { amount: 60, unit: 'second' },
  { amount: 60, unit: 'minute' },
  { amount: 24, unit: 'hour' },
  { amount: 7, unit: 'day' },
  { amount: 4.34524, unit: 'week' },
  { amount: 12, unit: 'month' },
  { amount: Number.POSITIVE_INFINITY, unit: 'year' },
] as const

export function formatRelativeTime(
  value: DateInput,
  locale: string,
  now: DateInput = new Date(),
) {
  let duration = (asDate(value).getTime() - asDate(now).getTime()) / 1000
  const format = new Intl.RelativeTimeFormat(intlLocale(locale), {
    numeric: 'auto',
  })

  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return format.format(Math.round(duration), division.unit)
    }
    duration /= division.amount
  }

  return format.format(0, 'second')
}
