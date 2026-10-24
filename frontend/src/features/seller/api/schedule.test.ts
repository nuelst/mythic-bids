import { defaultLotEndsAt, scheduleError, toDateTimeLocal } from './schedule'

describe('schedule', () => {
  const now = new Date('2026-10-24T12:00:00')

  it('rejects a lot shorter than one minute', () => {
    expect(scheduleError(undefined, toDateTimeLocal(now), now)).toBe('short')
  })

  it('accepts a one-day auction starting now', () => {
    expect(
      scheduleError(undefined, toDateTimeLocal(defaultLotEndsAt(now)), now),
    ).toBeNull()
  })

  it('rejects an end more than 90 days from now', () => {
    const far = new Date(now.getTime() + 91 * 24 * 60 * 60_000)
    expect(scheduleError(undefined, toDateTimeLocal(far), now)).toBe('far')
  })

  it('rejects a start in the past', () => {
    const start = new Date(now.getTime() - 5 * 60_000)
    const end = new Date(now.getTime() + 60 * 60_000)
    expect(scheduleError(toDateTimeLocal(start), toDateTimeLocal(end), now)).toBe(
      'past_start',
    )
  })

  it('rejects an end in the past', () => {
    const end = new Date(now.getTime() - 60_000)
    expect(scheduleError(undefined, toDateTimeLocal(end), now)).toBe('past_end')
  })

  it('rejects an end at or before the start', () => {
    const start = new Date(now.getTime() + 2 * 60 * 60_000)
    expect(
      scheduleError(toDateTimeLocal(start), toDateTimeLocal(start), now),
    ).toBe('before_start')
    const earlier = new Date(start.getTime() - 60_000)
    expect(
      scheduleError(toDateTimeLocal(start), toDateTimeLocal(earlier), now),
    ).toBe('before_start')
  })
})
