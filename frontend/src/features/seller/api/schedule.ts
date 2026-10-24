import { fromDateTimeLocal } from '#/shared/lib/datetime'

export const MIN_LOT_DURATION_MS = 60_000
export const MAX_LOT_HORIZON_MS = 90 * 24 * 60 * 60_000

export { fromDateTimeLocal, toDateTimeLocal } from '#/shared/lib/datetime'

export function defaultLotEndsAt(now = new Date()) {
  return new Date(now.getTime() + 24 * 60 * 60_000)
}

export type ScheduleError =
  | 'short'
  | 'far'
  | 'past_start'
  | 'past_end'
  | 'before_start'

export function scheduleError(
  startsAt: string | undefined,
  endsAt: string,
  now = new Date(),
): ScheduleError | null {
  const start = fromDateTimeLocal(startsAt ?? '')
  const end = fromDateTimeLocal(endsAt)
  if (!end) return 'short'
  if (start && start.getTime() < now.getTime() - MIN_LOT_DURATION_MS) {
    return 'past_start'
  }
  if (end.getTime() < now.getTime()) return 'past_end'
  if (start && end.getTime() <= start.getTime()) return 'before_start'
  const effectiveStart = start && start > now ? start : now
  if (end.getTime() - effectiveStart.getTime() < MIN_LOT_DURATION_MS) {
    return 'short'
  }
  if (end.getTime() - now.getTime() > MAX_LOT_HORIZON_MS) return 'far'
  return null
}
