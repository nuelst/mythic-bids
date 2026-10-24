import { applyOptimisticDeposit } from './wallet-view'

describe('applyOptimisticDeposit', () => {
  it('raises total and available, and leaves the hold untouched', () => {
    expect(
      applyOptimisticDeposit(
        { balanceCents: 10_000, committedCents: 3_000, availableCents: 7_000 },
        5_000,
      ),
    ).toEqual({
      balanceCents: 15_000,
      committedCents: 3_000,
      availableCents: 12_000,
    })
  })
})
