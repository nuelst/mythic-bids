import { act, renderHook, waitFor } from '@testing-library/react'
import { ApiError } from '#/shared/api/api-error'
import { queryKeys } from '#/shared/api/query-keys'
import { createQueryWrapper } from '#/test/query-wrapper'
import { deposit } from '../api/wallet-api'
import type { Wallet } from '../api/wallet-api'
import { useDepositForm } from './use-deposit-form'

vi.mock('../api/wallet-api', () => ({
  deposit: vi.fn(),
}))

const wallet: Wallet = {
  balanceCents: 10_000,
  committedCents: 2_000,
  availableCents: 8_000,
}

describe('useDepositForm', () => {
  beforeEach(() => {
    vi.mocked(deposit).mockReset()
  })

  it('raises the cached balances before the API answers', async () => {
    let finish!: (value: Wallet) => void
    vi.mocked(deposit).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    const { client, wrapper } = createQueryWrapper()
    client.setQueryData(queryKeys.wallet(), wallet)
    const { result } = renderHook(() => useDepositForm(), { wrapper })

    await act(async () => {
      result.current.form.setValue('amountCents', 5_000)
      await result.current.onSubmit()
    })

    expect(client.getQueryData(queryKeys.wallet())).toMatchObject({
      balanceCents: 15_000,
      availableCents: 13_000,
      committedCents: 2_000,
    })

    finish({
      balanceCents: 15_000,
      committedCents: 2_000,
      availableCents: 13_000,
    })
  })

  it('rolls the cache back when the deposit fails', async () => {
    vi.mocked(deposit).mockRejectedValue(new ApiError(500, 'nope'))
    const { client, wrapper } = createQueryWrapper()
    client.setQueryData(queryKeys.wallet(), wallet)
    const { result } = renderHook(() => useDepositForm(), { wrapper })

    await act(async () => {
      result.current.form.setValue('amountCents', 5_000)
      await result.current.onSubmit()
    })

    await waitFor(() =>
      expect(client.getQueryData(queryKeys.wallet())).toEqual(wallet),
    )
  })
})
