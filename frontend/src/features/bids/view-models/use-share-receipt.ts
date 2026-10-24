import { toast } from 'sonner'
import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { formatCents } from '#/shared/lib/money'
import { canWebShare, receiptUrl } from '../api/share'

export function useShareReceipt() {
  async function share(input: {
    token: string
    name: string
    amountCents: number
  }) {
    const url = receiptUrl(input.token, window.location.origin)
    const amount = formatCents(input.amountCents, getLocale())
    const data = {
      title: m.bids_share_title({ name: input.name }),
      text: m.bids_share_text({ name: input.name, amount }),
      url,
    }
    if (canWebShare(data)) {
      try {
        await navigator.share(data)
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }
    await navigator.clipboard.writeText(url)
    toast.success(m.copied())
  }

  return { share }
}
