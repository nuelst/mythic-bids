import { groupBidsByOutcome } from './bids-api'
import type { MyBid } from './bids-api'

function bid(outcome: MyBid['outcome'], id: string): MyBid {
  return {
    outcome,
    myHighestCents: 1000,
    receiptToken: outcome === 'WON' ? 'tok' : null,
    lot: {
      id,
      phase: 'CLOSED',
      startingPriceCents: 1000,
      minIncrementCents: 100,
      currentPriceCents: 1000,
      nextMinimumCents: 1100,
      finalPriceCents: 1000,
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
      sold: outcome === 'WON',
      settledAt: null,
      cancelledAt: null,
      createdAt: '2026-10-24T00:00:00.000Z',
    },
  }
}

describe('groupBidsByOutcome', () => {
  it('keeps the result order and drops empty groups', () => {
    const items = [
      bid('LOST', 'a'),
      bid('WON', 'b'),
      bid('WINNING', 'c'),
      bid('WON', 'd'),
    ]
    expect(groupBidsByOutcome(items).map((group) => group.outcome)).toEqual([
      'WINNING',
      'WON',
      'LOST',
    ])
    expect(
      groupBidsByOutcome(items)[1]?.items.map((item) => item.lot.id),
    ).toEqual(['b', 'd'])
  })
})
