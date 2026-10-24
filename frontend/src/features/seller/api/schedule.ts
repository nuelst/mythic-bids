export const MIN_LOT_DURATION_MS = 60_000
export const MAX_LOT_HORIZON_MS = 90 * 24 * 60 * 60_000

const pad = (value: number) => String(value).padStart(2, '0')

/** Value for `datetime-local` from a Date, in the user's timezone. */
export function toDateTimeLocal(value: Date) {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`
}

export function fromDateTimeLocal(value: string) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function defaultLotEndsAt(now = new Date()) {
  return new Date(now.getTime() + 24 * 60 * 60_000)
}

export function scheduleError(
  startsAt: string | undefined,
  endsAt: string,
  now = new Date(),
): 'short' | 'far' | null {
  const start = fromDateTimeLocal(startsAt ?? '') ?? now
  const effectiveStart = start > now ? start : now
  const end = fromDateTimeLocal(endsAt)
  if (!end) return 'short'
  if (end.getTime() - effectiveStart.getTime() < MIN_LOT_DURATION_MS) {
    return 'short'
  }
  if (end.getTime() - now.getTime() > MAX_LOT_HORIZON_MS) return 'far'
  return null
}
