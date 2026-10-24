import {
  resetServerClock,
  serverNow,
  serverOffsetMs,
  setServerTime,
} from './server-clock'

describe('server clock', () => {
  afterEach(() => {
    resetServerClock()
    vi.useRealTimers()
  })

  it('starts aligned with the device clock', () => {
    expect(Math.abs(serverOffsetMs())).toBe(0)
  })

  it('stores the offset from a server timestamp', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-24T15:00:00.000Z'))
    setServerTime('2026-10-24T15:00:05.000Z')
    expect(serverOffsetMs()).toBe(5000)
    expect(serverNow().toISOString()).toBe('2026-10-24T15:00:05.000Z')
  })
})
