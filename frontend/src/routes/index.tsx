import { createFileRoute } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">{m.app_name()}</h1>
    </main>
  )
}
