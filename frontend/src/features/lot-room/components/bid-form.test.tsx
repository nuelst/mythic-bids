import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { placeBid } from '../api/room-api'
import type { LotRoom } from '../api/room-api'
import { BidForm } from './bid-form'

vi.mock('../api/room-api', () => ({
  placeBid: vi.fn(),
}))

function room(): LotRoom {
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
      typeLine: null,
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
  }
}

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  client.setQueryData(['lots', 'lot-1'], room())
  return render(
    <QueryClientProvider client={client}>
      <BidForm room={room()} />
    </QueryClientProvider>,
  )
}

describe('BidForm', () => {
  beforeEach(() => {
    vi.mocked(placeBid)
      .mockReset()
      .mockResolvedValue({
        currentPriceCents: 3600,
        nextMinimumCents: 3900,
        bidCount: 2,
        endsAt: '2026-10-26T00:00:00.000Z',
        extended: false,
        bid: {
          amountCents: 3600,
          seq: 2,
          bidderAlias: 'B-BBBB',
          createdAt: '2026-10-24T00:00:01.000Z',
          hash: 'abc',
        },
      })
  })

  it('fills the amount from the +1 increment shortcut', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: '+1 incremento' }))
    expect(screen.getByLabelText('O teu lance')).toHaveValue('36,00')
  })

  it('submits the next minimum', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getByRole('button', { name: 'Dar lance' }))
    expect(placeBid).toHaveBeenCalledWith('lot-1', 3300, expect.any(String))
  })
})
