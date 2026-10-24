import { applyOptimisticCancel, canCancel } from './seller-api'
import type { Lot } from './seller-api'

function lot(phase: Lot['phase']): Lot {
  return {
    id: 'lot-1',
    phase,
    startingPriceCents: 1000,
    minIncrementCents: 100,
    currentPriceCents: 1000,
    nextMinimumCents: 1100,
    finalPriceCents: null,
    item: {
      id: 'item-1',
      locale: 'en',
      name: 'Sol Ring',
      typeLine: null,
      rulesText: null,
      flavorText: null,
      lang: 'en',
      rarity: 'uncommon',
      setCode: 'cmm',
      setName: 'Commander Masters',
      collectorNumber: '1',
      manaCost: null,
      colors: [],
      artist: null,
      releasedAt: null,
      referencePrice: null,
      imageUrl: '/catalog/items/item-1/image',
    },
    bidCount: 1,
    startsAt: '2026-10-24T00:00:00.000Z',
    endsAt: '2026-10-25T00:00:00.000Z',
    originalEndsAt: '2026-10-25T00:00:00.000Z',
    extended: false,
    sold: false,
    settledAt: null,
    cancelledAt: null,
    createdAt: '2026-10-24T00:00:00.000Z',
  }
}

describe('seller lot helpers', () => {
  it('allows cancelling live or scheduled lots', () => {
    expect(canCancel(lot('LIVE'))).toBe(true)
    expect(canCancel(lot('SCHEDULED'))).toBe(true)
    expect(canCancel(lot('CLOSED'))).toBe(false)
  })

  it('marks a lot as cancelled without waiting for the API', () => {
    const now = new Date('2026-10-24T12:00:00.000Z')
    expect(applyOptimisticCancel(lot('LIVE'), now)).toMatchObject({
      phase: 'CANCELLED',
      cancelledAt: now.toISOString(),
    })
  })
})
