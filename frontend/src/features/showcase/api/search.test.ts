import {
  compactShowcaseSearch,
  normalizeShowcaseQuery,
  toShowcaseQuery,
  validateShowcaseSearch,
} from './search'

describe('showcase search', () => {
  it('defaults missing or invalid params', () => {
    expect(validateShowcaseSearch({})).toEqual({})
    expect(validateShowcaseSearch({ phase: 'LIVE', page: '1' })).toEqual({})
    expect(
      validateShowcaseSearch({ phase: 'OPEN', rarity: 'gold', page: 'nope' }),
    ).toEqual({})
  })

  it('keeps a valid filter set', () => {
    expect(
      validateShowcaseSearch({
        phase: 'SCHEDULED',
        q: '  angel ',
        rarity: 'rare',
        page: '3',
      }),
    ).toEqual({
      phase: 'SCHEDULED',
      q: 'angel',
      rarity: 'rare',
      page: 3,
    })
  })

  it('ignores a query shorter than 2 characters', () => {
    expect(normalizeShowcaseQuery('a')).toBeUndefined()
    expect(normalizeShowcaseQuery('  ab  ')).toBe('ab')
  })

  it('sends LIVE and page 1 to the API when the URL is empty', () => {
    expect(toShowcaseQuery({})).toEqual({
      phase: 'LIVE',
      q: undefined,
      rarity: undefined,
      page: 1,
      pageSize: 20,
    })
  })

  it('omits defaults when writing the URL', () => {
    expect(
      compactShowcaseSearch({
        phase: 'LIVE',
        q: 'a',
        page: 1,
      }),
    ).toEqual({})
    expect(
      compactShowcaseSearch({
        phase: 'CLOSED',
        q: 'bolt',
        rarity: 'mythic',
        page: 2,
      }),
    ).toEqual({
      phase: 'CLOSED',
      q: 'bolt',
      rarity: 'mythic',
      page: 2,
    })
  })
})
