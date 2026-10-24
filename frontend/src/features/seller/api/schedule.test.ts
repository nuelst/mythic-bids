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
})
