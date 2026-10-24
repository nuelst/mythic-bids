import { createFileRoute } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="container-page py-10">
      <h1 className="font-display text-4xl font-bold">{m.app_name()}</h1>
    </main>
  )
}
