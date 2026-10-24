import { loginSchema, registerSchema } from './schemas'

describe('auth schemas', () => {
  it('accepts a valid login', () => {
    expect(
      loginSchema.safeParse({
        email: 'ana@example.com',
        password: 'password1',
      }).success,
    ).toBe(true)
  })

  it('rejects a short password and a bad email', () => {
    expect(
      loginSchema.safeParse({ email: 'ana', password: 'short' }).success,
    ).toBe(false)
  })

  it('accepts a valid registration', () => {
    expect(
      registerSchema.safeParse({
        name: 'Ana',
        email: 'ana@example.com',
        password: 'password1',
        role: 'BIDDER',
      }).success,
    ).toBe(true)
  })

  it('rejects a name that is too short', () => {
    expect(
      registerSchema.safeParse({
        name: 'A',
        email: 'ana@example.com',
        password: 'password1',
        role: 'AUCTIONEER',
      }).success,
    ).toBe(false)
  })
})
