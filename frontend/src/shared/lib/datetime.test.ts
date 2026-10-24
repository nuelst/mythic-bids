import {
  formatCountdown,
  formatDate,
  formatDateTime,
  formatRelativeTime,
} from './datetime'

const NOW = new Date('2026-10-24T15:00:00.000Z')

describe('datetime', () => {
  it('formats a date and time for each locale', () => {
    const value = new Date('2026-10-24T15:30:00-03:00')
    expect(formatDateTime(value, 'pt')).toMatch(/24\/10\/2026/)
    expect(formatDateTime(value, 'en')).toMatch(/10\/24\/2026/)
  })

  it('formats a calendar date', () => {
    expect(formatDate('2026-10-24T15:30:00.000Z', 'en')).toContain('2026')
  })

  it('formats relative time around a fixed now', () => {
    expect(formatRelativeTime('2026-10-24T14:00:00.000Z', 'en', NOW)).toBe(
      '1 hour ago',
    )
    expect(formatRelativeTime('2026-10-26T15:00:00.000Z', 'en', NOW)).toBe(
      'in 2 days',
    )
    expect(formatRelativeTime(NOW, 'en', NOW)).toBe('now')
  })

  it('formats a countdown', () => {
    expect(formatCountdown(45_000)).toBe('00:45')
    expect(formatCountdown(3_661_000)).toBe('1:01:01')
    expect(formatCountdown(0)).toBeNull()
  })
})
