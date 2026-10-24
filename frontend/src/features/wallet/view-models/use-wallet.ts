import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ledgerQueryOptions, walletQueryOptions } from '../api/wallet-api'
import type { WalletSearch } from '../api/search'

export function useWallet(search: WalletSearch) {
  const navigate = useNavigate({ from: '/wallet' })
  const page = search.page ?? 1

  const wallet = useQuery(walletQueryOptions())
  const ledger = useQuery({
    ...ledgerQueryOptions(page),
    placeholderData: keepPreviousData,
  })

  function setPage(next: number) {
    void navigate({
      search: next > 1 ? { page: next } : {},
      replace: true,
    })
  }

  return {
    page,
    wallet: wallet.data,
    ledger: ledger.data,
    isPending: wallet.isPending,
    isError: wallet.isError && !wallet.data,
    refetch: () => {
      void wallet.refetch()
      void ledger.refetch()
    },
    setPage,
  }
}
