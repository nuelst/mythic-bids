import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { m } from '#/paraglide/messages'
import { queryKeys } from '#/shared/api/query-keys'
import { setSession } from '#/shared/auth/session'
import { useSession } from '#/shared/auth/use-session'
import { LocaleSwitcher } from '#/shared/i18n/locale-switcher'
import { ThemeToggle } from '#/shared/theme/theme-toggle'
import { Button } from '#/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/shared/ui/dropdown-menu'
import { Logo } from '#/shared/ui/logo'

export function AppHeader() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  if (pathname === '/design') return null
  return <HeaderBar />
}

function HeaderBar() {
  const session = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  function logout() {
    setSession(null)
    queryClient.removeQueries({ queryKey: queryKeys.me() })
    void navigate({ to: '/' })
  }

  return (
    <header className="border-b bg-background">
      <div className="container-page flex h-16 items-center gap-4">
        <Link to="/" className="shrink-0">
          <Logo />
        </Link>
        <nav className="flex min-w-0 flex-1 items-center gap-3 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            {m.nav_home()}
          </Link>
          {session?.user.role === 'BIDDER' && (
            <>
              <Link
                to="/wallet"
                className="text-muted-foreground hover:text-foreground"
              >
                {m.nav_wallet()}
              </Link>
              <Link
                to="/me/bids"
                className="text-muted-foreground hover:text-foreground"
              >
                {m.nav_bids()}
              </Link>
            </>
          )}
          {session?.user.role === 'AUCTIONEER' && (
            <Link
              to="/seller"
              className="text-muted-foreground hover:text-foreground"
            >
              {m.nav_seller()}
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-1">
          <LocaleSwitcher />
          <ThemeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="max-w-40 truncate">
                  {session.user.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <span className="block truncate">{session.user.email}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {session.user.role === 'AUCTIONEER'
                      ? m.role_auctioneer()
                      : m.role_bidder()}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  {m.nav_logout()}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login" search={{ redirect: undefined }}>
                  {m.nav_login()}
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register" search={{ redirect: undefined }}>
                  {m.nav_register()}
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
