import { matchesSellerPhase, validateSellerSearch } from './search'

describe('seller search', () => {
  it('keeps a known phase and a page above 1', () => {
    expect(validateSellerSearch({ phase: 'LIVE', page: 2 })).toEqual({
      phase: 'LIVE',
      page: 2,
    })
  })

  it('treats closing lots as closed', () => {
    expect(matchesSellerPhase('CLOSING', 'CLOSED')).toBe(true)
    expect(matchesSellerPhase('LIVE', 'CLOSED')).toBe(false)
    expect(matchesSellerPhase('CANCELLED')).toBe(true)
  })
})
