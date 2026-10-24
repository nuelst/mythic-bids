import { createFileRoute } from '@tanstack/react-router'
import { SellerPage } from '#/features/seller/pages/seller-page'
import { validateSellerSearch } from '#/features/seller/api/search'

export const Route = createFileRoute('/seller/')({
  validateSearch: validateSellerSearch,
  component: SellerIndex,
})

function SellerIndex() {
  return <SellerPage search={Route.useSearch()} />
}
