import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { queryKeys } from '#/shared/api/query-keys'
import { useSession } from '#/shared/auth/use-session'
import { API_URL } from '#/shared/lib/env'
import { formatCents } from '#/shared/lib/money'
import { useEventStream } from '#/shared/lib/sse'

function asRecord(value: unknown) {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null
}

function asCents(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function privateEventsUrl(token: string) {
  const url = new URL('/me/events', `${API_URL}/`)
  url.searchParams.set('token', token)
  return url.toString()
}

/** Private SSE: outbid / won toasts and wallet invalidation. */
export function PrivateEvents() {
  const session = useSession()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const url = session ? privateEventsUrl(session.accessToken) : null

  useEventStream(
    url,
    {
      'bid.outbid': (data) => {
        const bid = asRecord(asRecord(data)?.bid)
        const cents = asCents(bid?.amountCents)
        toast.warning(
          cents == null
            ? m.toast_outbid_plain()
            : m.toast_outbid({ amount: formatCents(cents, getLocale()) }),
        )
      },
      'lot.won': (data) => {
        const payload = asRecord(data)
        const cents = asCents(payload?.amountCents)
        const token =
          typeof payload?.receiptToken === 'string'
            ? payload.receiptToken
            : undefined
        toast.success(
          cents == null
            ? m.toast_lot_won_plain()
            : m.toast_lot_won({ amount: formatCents(cents, getLocale()) }),
          token
            ? {
                action: {
                  label: m.toast_view_receipt(),
                  onClick: () =>
                    void navigate({
                      to: '/receipts/$token',
                      params: { token },
                    }),
                },
              }
            : undefined,
        )
      },
      'wallet.changed': () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.wallet() })
        void queryClient.invalidateQueries({ queryKey: queryKeys.ledger() })
      },
    },
    {
      onOpen: () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.wallet() })
        void queryClient.invalidateQueries({ queryKey: queryKeys.myBids() })
      },
    },
  )

  return null
}
