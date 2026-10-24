import { createFileRoute } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/receipts/$token')({
  component: ReceiptPlaceholder,
})

function ReceiptPlaceholder() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold">
        {m.toast_view_receipt()}
      </h1>
    </main>
  )
}
