import { act, renderHook, waitFor } from '@testing-library/react'
import { ApiError } from '#/shared/api/api-error'
import { queryKeys } from '#/shared/api/query-keys'
import { createQueryWrapper } from '#/test/query-wrapper'
import { placeBid } from '../api/room-api'
import type { LotRoom } from '../api/room-api'
import { useBidForm } from './use-bid-form'

vi.mock('../api/room-api', () => ({
  placeBid: vi.fn(),
}))

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
    bids: [],
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

describe('useBidForm', () => {
  beforeEach(() => {
    vi.mocked(placeBid).mockReset()
  })

  it('shows the bid in the lot cache before the API answers', async () => {
    let finish!: (value: Awaited<ReturnType<typeof placeBid>>) => void
    vi.mocked(placeBid).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    const current = room()
    const { client, wrapper } = createQueryWrapper()
    client.setQueryData(queryKeys.lot(current.id), current)
    const { result } = renderHook(() => useBidForm(current), { wrapper })

    await act(async () => {
      result.current.form.setValue('amountCents', 3300)
      await result.current.onSubmit()
    })

    expect(
      client.getQueryData<LotRoom>(queryKeys.lot(current.id)),
    ).toMatchObject({
      currentPriceCents: 3300,
      viewer: { isLeading: true, alias: 'B-BBBB' },
    })

    finish({
      currentPriceCents: 3300,
      nextMinimumCents: 3600,
      bidCount: 1,
      endsAt: current.endsAt,
      extended: false,
      bid: {
        amountCents: 3300,
        seq: 1,
        bidderAlias: 'B-BBBB',
        createdAt: '2026-10-24T00:00:01.000Z',
        hash: 'abc',
      },
    })
  })

  it('puts BELOW_MINIMUM on the amount field', async () => {
    vi.mocked(placeBid).mockRejectedValue(
      new ApiError(422, 'low', 'BELOW_MINIMUM', 3300),
    )
    const current = room()
    const { client, wrapper } = createQueryWrapper()
    client.setQueryData(queryKeys.lot(current.id), current)
    const { result } = renderHook(() => useBidForm(current), { wrapper })
    // RHF only updates formState after a subscriber reads it.
    void result.current.form.formState.errors

    await act(async () => {
      result.current.form.setValue('amountCents', 3300)
      await result.current.onSubmit()
    })

    await waitFor(() => {
      expect(result.current.form.formState.errors.amountCents?.message).toMatch(
        /mínimo|33/i,
      )
    })
  })

  it('computes the increment shortcuts from the next minimum', () => {
    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useBidForm(room()), { wrapper })
    expect(result.current.minimumCents).toBe(3300)
    expect(result.current.plusOneCents).toBe(3600)
    expect(result.current.plusFiveCents).toBe(4800)
  })
})
