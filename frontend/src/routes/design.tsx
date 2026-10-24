import { createFileRoute, notFound } from '@tanstack/react-router'
import { DesignPage } from '#/app/design-page'

export const Route = createFileRoute('/design')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound()
  },
  component: DesignPage,
})
