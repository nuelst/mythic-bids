import { createFileRoute } from '@tanstack/react-router'
import { NewLotPage } from '#/features/seller/pages/new-lot-page'

export const Route = createFileRoute('/seller/new')({
  component: NewLotPage,
})
