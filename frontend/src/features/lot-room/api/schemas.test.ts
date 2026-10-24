import { bidSchema } from './schemas'

describe('bidSchema', () => {
  it('accepts a positive amount in cents', () => {
    expect(bidSchema.safeParse({ amountCents: 3300 }).success).toBe(true)
  })

  it('rejects empty, zero and oversized amounts', () => {
    expect(bidSchema.safeParse({ amountCents: null }).success).toBe(false)
    expect(bidSchema.safeParse({ amountCents: 0 }).success).toBe(false)
    expect(bidSchema.safeParse({ amountCents: 100_000_001 }).success).toBe(
      false,
    )
  })
})
