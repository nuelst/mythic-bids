import { toDateTimeLocal } from './schedule'
import { createLotSchema } from './schemas'

describe('createLotSchema', () => {
  const now = new Date('2026-10-24T12:00:00')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const valid = {
    itemId: 'item-1',
    startingPriceCents: 1000,
    minIncrementCents: 100,
    startsAt: '',
    endsAt: toDateTimeLocal(new Date(now.getTime() + 60 * 60_000)),
  }

  it('accepts a lot that starts now and ends later', () => {
    expect(createLotSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a start in the past', () => {
    const result = createLotSchema.safeParse({
      ...valid,
      startsAt: toDateTimeLocal(new Date(now.getTime() - 5 * 60_000)),
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues[0]?.path).toEqual(['startsAt'])
  })

  it('rejects an end at the start', () => {
    const start = toDateTimeLocal(new Date(now.getTime() + 2 * 60 * 60_000))
    const result = createLotSchema.safeParse({
      ...valid,
      startsAt: start,
      endsAt: start,
    })
    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.error.issues[0]?.path).toEqual(['endsAt'])
  })
})
