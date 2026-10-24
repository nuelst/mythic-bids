import { createFileRoute } from '@tanstack/react-router'
import { NewLotPage } from '#/features/seller/pages/new-lot-page'
import { requireRole } from '#/shared/auth/guards'

export const Route = createFileRoute('/seller/new')({
  ssr: false,
  beforeLoad: requireRole('AUCTIONEER'),
  component: NewLotPage,
})
