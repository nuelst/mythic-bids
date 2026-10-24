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
import { RouteError, RouteNotFound, RoutePending } from '#/app/route-states'
import { SkipLink } from '#/app/skip-link'
import { m } from '#/paraglide/messages'
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
      { title: m.app_name() },
      { name: 'description', content: m.app_description() },
      { name: 'theme-color', content: '#5B3FD9' },
      { name: 'color-scheme', content: 'light dark' },
      { property: 'og:site_name', content: m.app_name() },
      { property: 'og:title', content: m.app_name() },
      { property: 'og:description', content: m.app_description() },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/favicon.svg' },
    ],
    scripts: [{ children: themeScript }],
  }),
  errorComponent: RouteError,
  notFoundComponent: RouteNotFound,
  pendingComponent: RoutePending,
  shellComponent: RootDocument,
  component: RootLayout,
})

function RootLayout() {
  return (
    <>
      <SkipLink />
      <SessionBridge />
      <PrivateEvents />
      <AppHeader />
      <div id="main-content" tabIndex={-1} className="outline-none">
        <Outlet />
      </div>
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
