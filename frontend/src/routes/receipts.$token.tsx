import { createFileRoute } from '@tanstack/react-router'
import { isApiError } from '#/shared/api/api-error'
import { ReceiptPage } from '#/features/receipt/pages/receipt-page'
import {
  auditQueryOptions,
  publicKeyQueryOptions,
  receiptQueryOptions,
} from '#/features/receipt/api/receipt-api'
import { receiptHeadMeta } from '#/features/receipt/api/receipt-view'
import { m } from '#/paraglide/messages'
import type { Receipt } from '#/features/receipt/api/receipt-api'

export const Route = createFileRoute('/receipts/$token')({
  loader: async ({ context, params }) => {
    try {
      const receipt = await context.queryClient.ensureQueryData(
        receiptQueryOptions(params.token),
      )
      void context.queryClient.prefetchQuery(auditQueryOptions(receipt.lot.id))
      void context.queryClient.prefetchQuery(publicKeyQueryOptions())
      return { receipt }
    } catch (error) {
      if (
        isApiError(error) &&
        (error.status === 404 || error.code === 'RECEIPT_NOT_FOUND')
      ) {
        return { receipt: null as Receipt | null }
      }
      throw error
    }
  },
  head: ({ loaderData }) => {
    const receipt = loaderData?.receipt
    if (!receipt) {
      return { meta: [{ title: m.error_receipt_not_found() }] }
    }
    return { meta: receiptHeadMeta(receipt) }
  },
  component: ReceiptRoute,
})

function ReceiptRoute() {
  const { token } = Route.useParams()
  return <ReceiptPage token={token} />
}
