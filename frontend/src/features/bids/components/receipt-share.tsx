import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Share2 } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Button, buttonVariants } from '#/shared/ui/button'
import { CopyButton } from '#/shared/ui/copy-button'
import { canWebShare, receiptPath, receiptUrl } from '../api/share'
import { useShareReceipt } from '../view-models/use-share-receipt'

export function ReceiptShare({
  token,
  name,
  amountCents,
}: {
  token: string
  name: string
  amountCents: number
}) {
  const { share } = useShareReceipt()
  const [url, setUrl] = useState(() => receiptPath(token))
  const [shareable, setShareable] = useState(false)

  useEffect(() => {
    const next = receiptUrl(token, window.location.origin)
    setUrl(next)
    setShareable(canWebShare({ url: next, title: name, text: name }))
  }, [token, name])

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Link
        to="/receipts/$token"
        params={{ token }}
        className={buttonVariants({ variant: 'secondary', size: 'sm' })}
      >
        {m.toast_view_receipt()}
      </Link>
      <CopyButton value={url} label={m.bids_copy_link()} />
      {shareable && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={m.bids_share()}
          title={m.bids_share()}
          onClick={() => void share({ token, name, amountCents })}
        >
          <Share2 />
        </Button>
      )}
    </div>
  )
}
