import {
  applyBidPlaced,
  applyLotCancelled,
  applyLotClosed,
  applyOptimisticBid,
  applyPlaceResult,
  parseBidPlaced,
  parseLotClosed,
} from './room-events'
import type { LotRoom } from './room-api'

function room(overrides: Partial<LotRoom> = {}): LotRoom {
  return {
    id: 'lot-1',
    phase: 'LIVE',
    startingPriceCents: 3000,
    minIncrementCents: 300,
    currentPriceCents: 3000,
    nextMinimumCents: 3300,
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
    bidCount: 1,
    startsAt: '2026-10-23T00:00:00.000Z',
    endsAt: '2026-10-26T00:00:00.000Z',
    originalEndsAt: '2026-10-26T00:00:00.000Z',
    extended: false,
    sold: false,
    settledAt: null,
    cancelledAt: null,
    createdAt: '2026-10-23T00:00:00.000Z',
    serverTime: '2026-10-24T00:00:00.000Z',
    leaderAlias: 'B-AAAA',
    bids: [
      {
        amountCents: 3000,
        seq: 1,
        bidderAlias: 'B-AAAA',
        createdAt: '2026-10-23T12:00:00.000Z',
      },
    ],
    viewer: {
      alias: 'B-BBBB',
      myHighestCents: null,
      isLeading: false,
      position: null,
      bidders: 1,
    },
    ...overrides,
  }
}

const placed = {
  currentPriceCents: 3600,
  nextMinimumCents: 3900,
  bidCount: 2,
  endsAt: '2026-10-26T00:02:00.000Z',
  extended: true,
  bid: {
    amountCents: 3600,
    seq: 2,
    bidderAlias: 'B-BBBB',
    createdAt: '2026-10-24T00:00:01.000Z',
  },
}

describe('parseBidPlaced', () => {
  it('reads a well-formed payload', () => {
    expect(parseBidPlaced({ lotId: 'lot-1', ...placed })).toEqual(placed)
  })

  it('rejects a payload without a bid', () => {
    expect(parseBidPlaced({ currentPriceCents: 1 })).toBeNull()
  })
})

describe('applyBidPlaced', () => {
  it('prepends a new bid and marks the viewer as leading', () => {
    const next = applyBidPlaced(room(), placed)
    expect(next.currentPriceCents).toBe(3600)
    expect(next.extended).toBe(true)
    expect(next.leaderAlias).toBe('B-BBBB')
    expect(next.bids[0]).toMatchObject({ seq: 2, pending: undefined })
    expect(next.viewer).toMatchObject({
      isLeading: true,
      position: 1,
      myHighestCents: 3600,
    })
  })

  it('is idempotent for the same seq and drops a pending row', () => {
    const optimistic = applyOptimisticBid(room(), 3600, 'B-BBBB')
    const once = applyBidPlaced(optimistic, placed)
    const twice = applyBidPlaced(once, placed)
    expect(once.bids).toHaveLength(2)
    expect(twice.bids).toEqual(once.bids)
    expect(once.bids.some((bid) => bid.pending)).toBe(false)
  })

  it('marks the previous leader as outbid', () => {
    const leading = room({
      viewer: {
        alias: 'B-AAAA',
        myHighestCents: 3000,
        isLeading: true,
        position: 1,
        bidders: 2,
      },
    })
    const next = applyBidPlaced(leading, placed)
    expect(next.viewer).toMatchObject({
      isLeading: false,
      position: 2,
      myHighestCents: 3000,
    })
  })
})

describe('applyOptimisticBid', () => {
  it('shows the bid immediately as pending', () => {
    const next = applyOptimisticBid(
      room(),
      3600,
      'B-BBBB',
      new Date('2026-10-24T00:00:00.000Z'),
    )
    expect(next.bids[0]).toMatchObject({
      amountCents: 3600,
      pending: true,
      bidderAlias: 'B-BBBB',
    })
    expect(next.nextMinimumCents).toBe(3900)
    expect(next.viewer?.isLeading).toBe(true)
  })
})

describe('applyPlaceResult', () => {
  it('replaces the pending row with the confirmed bid', () => {
    const optimistic = applyOptimisticBid(room(), 3600, 'B-BBBB')
    const next = applyPlaceResult(optimistic, {
      ...placed,
      bid: { ...placed.bid, hash: 'abc' },
    })
    expect(next.bids[0]).toMatchObject({ seq: 2, pending: undefined })
    expect(next.bids.some((bid) => bid.pending)).toBe(false)
  })
})

describe('applyLotClosed / cancelled', () => {
  it('closes a sold lot', () => {
    expect(
      applyLotClosed(room(), {
        sold: true,
        winnerAlias: 'B-BBBB',
        finalPriceCents: 3600,
      }),
    ).toMatchObject({
      phase: 'CLOSED',
      sold: true,
      leaderAlias: 'B-BBBB',
      finalPriceCents: 3600,
    })
  })

  it('parses a closed payload and rejects junk', () => {
    expect(parseLotClosed({ sold: false })).toEqual({ sold: false })
    expect(parseLotClosed({})).toBeNull()
  })

  it('marks the lot as cancelled', () => {
    expect(applyLotCancelled(room()).phase).toBe('CANCELLED')
  })
})
