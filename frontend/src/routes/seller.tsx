import { Outlet, createFileRoute } from '@tanstack/react-router'
import { requireRole } from '#/shared/auth/guards'

export const Route = createFileRoute('/seller')({
  ssr: false,
  beforeLoad: requireRole('AUCTIONEER'),
  component: SellerLayout,
})

function SellerLayout() {
  return <Outlet />
}
