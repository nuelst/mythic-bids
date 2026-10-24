import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { Devtools } from '#/app/devtools'
import { AppHeader } from '#/app/header'
import { PrivateEvents } from '#/app/private-events'
import { Providers } from '#/app/providers'
import { getLocale } from '#/paraglide/runtime'
import { SessionBridge } from '#/shared/auth/session-bridge'
import { themeScript } from '#/shared/theme/theme'
import appCss from '#/styles/app.css?url'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Mythic Bids' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
    scripts: [{ children: themeScript }],
  }),
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootLayout() {
  return (
    <>
      <SessionBridge />
      <PrivateEvents />
      <AppHeader />
      <Outlet />
    </>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    // The theme script sets the "dark" class before React hydrates.
    <html lang={getLocale()} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <Providers>{children}</Providers>
        {import.meta.env.DEV && <Devtools />}
        <Scripts />
      </body>
    </html>
  )
}
