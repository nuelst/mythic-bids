import { displayPriceCents } from './lot-view'
import type { Lot } from './showcase-api'

function lot(overrides: Partial<Lot>): Lot {
  return {
    id: 'lot-1',
    phase: 'LIVE',
    startingPriceCents: 3000,
    minIncrementCents: 300,
    currentPriceCents: null,
    nextMinimumCents: 3000,
    finalPriceCents: null,
    item: {
      id: 'item-1',
      locale: 'en',
      name: 'Serra Angel',
      typeLine: 'Creature — Angel',
      rulesText: null,
      flavorText: null,
      lang: 'en',
      rarity: 'uncommon',
      setCode: 'fdn',
      setName: 'Foundations',
      collectorNumber: '740',
      manaCost: null,
      colors: [],
      artist: null,
      releasedAt: null,
      referencePrice: null,
      imageUrl: '/catalog/items/item-1/image',
    },
    bidCount: 0,
    startsAt: '2026-10-24T00:00:00.000Z',
    endsAt: '2026-10-26T00:00:00.000Z',
    originalEndsAt: '2026-10-26T00:00:00.000Z',
    extended: false,
    sold: false,
    settledAt: null,
    cancelledAt: null,
    createdAt: '2026-10-23T00:00:00.000Z',
    ...overrides,
  }
}

describe('displayPriceCents', () => {
  it('uses the starting price before anyone bids', () => {
    expect(displayPriceCents(lot({ currentPriceCents: null }))).toBe(3000)
  })

  it('uses the current price while the lot is live', () => {
    expect(displayPriceCents(lot({ currentPriceCents: 4500 }))).toBe(4500)
  })

  it('prefers the hammer price when the lot has closed', () => {
    expect(
      displayPriceCents(
        lot({
          phase: 'CLOSED',
          currentPriceCents: 4500,
          finalPriceCents: 4800,
          sold: true,
        }),
      ),
    ).toBe(4800)
  })
})
