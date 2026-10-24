import { createFileRoute } from '@tanstack/react-router'
import { SellerPage } from '#/features/seller/pages/seller-page'
import { requireRole } from '#/shared/auth/guards'

function validateSearch(search: Record<string, unknown>) {
  const page = Number(search.page)
  return Number.isInteger(page) && page > 1 ? { page } : {}
}

export const Route = createFileRoute('/seller')({
  ssr: false,
  validateSearch,
  beforeLoad: requireRole('AUCTIONEER'),
  component: SellerRoute,
})

function SellerRoute() {
  const { page } = Route.useSearch()
  return <SellerPage page={page} />
}
