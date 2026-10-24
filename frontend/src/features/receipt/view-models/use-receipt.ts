import { useQuery } from '@tanstack/react-query'
import { isApiError } from '#/shared/api/api-error'
import {
  auditQueryOptions,
  publicKeyQueryOptions,
  receiptQueryOptions,
} from '../api/receipt-api'

export function useReceipt(token: string) {
  const receipt = useQuery({
    ...receiptQueryOptions(token),
    retry: (count, error) => {
      if (isApiError(error) && error.status === 404) return false
      return count < 1
    },
  })
  const lotId = receipt.data?.lot.id ?? ''
  const audit = useQuery({
    ...auditQueryOptions(lotId),
    enabled: Boolean(lotId),
  })
  const publicKey = useQuery(publicKeyQueryOptions())

  return {
    receipt: receipt.data,
    audit: audit.data,
    publicKey: publicKey.data,
    isPending: receipt.isPending,
    isNotFound: isApiError(receipt.error) && receipt.error.status === 404,
    isError: receipt.isError && !receipt.data,
    auditError: audit.isError && !audit.data,
    refetch: () => {
      void receipt.refetch()
      void audit.refetch()
      void publicKey.refetch()
    },
  }
}
