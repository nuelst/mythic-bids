import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { CircleUser, Menu } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { queryKeys } from '#/shared/api/query-keys'
import { setSession } from '#/shared/auth/session'
import { useSession } from '#/shared/auth/use-session'
import { LocaleSwitcher } from '#/shared/i18n/locale-switcher'
import { cn } from '#/shared/lib/cn'
import { ThemeToggle } from '#/shared/theme/theme-toggle'
import { Button, buttonVariants } from '#/shared/ui/button'
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
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  function logout() {
    setSession(null)
    queryClient.removeQueries({ queryKey: queryKeys.me() })
    void navigate({ to: '/', search: {} })
  }

  function isCurrent(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <header className="border-b bg-background">
      <div className="container-page flex h-16 items-center gap-2 sm:gap-4">
        <Link to="/" search={{}} aria-label={m.app_name()} className="shrink-0">
          <Logo wordmarkClassName="hidden sm:inline" />
        </Link>
        <nav
          aria-label={m.nav_label()}
          className="hidden min-w-0 flex-1 items-center gap-3 text-sm md:flex"
        >
          <HeaderLink to="/" current={isCurrent('/')}>
            {m.nav_home()}
          </HeaderLink>
          {session?.user.role === 'BIDDER' && (
            <>
              <HeaderLink to="/wallet" current={isCurrent('/wallet')}>
                {m.nav_wallet()}
              </HeaderLink>
              <HeaderLink to="/me/bids" current={isCurrent('/me/bids')}>
                {m.nav_bids()}
              </HeaderLink>
            </>
          )}
          {session?.user.role === 'AUCTIONEER' && (
            <HeaderLink to="/seller" current={isCurrent('/seller')}>
              {m.nav_seller()}
            </HeaderLink>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <MobileNav />
          <LocaleSwitcher />
          <ThemeToggle />
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="max-w-36 gap-2 sm:max-w-48">
                  <CircleUser className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{session.user.name}</span>
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
            <div className="hidden items-center gap-1 sm:flex">
              <Link
                to="/login"
                search={{ redirect: undefined }}
                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
              >
                {m.nav_login()}
              </Link>
              <Link
                to="/register"
                search={{ redirect: undefined }}
                className={buttonVariants({ variant: 'primary', size: 'sm' })}
              >
                {m.nav_register()}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function HeaderLink({
  to,
  current,
  children,
}: {
  to: '/' | '/wallet' | '/me/bids' | '/seller'
  current: boolean
  children: string
}) {
  return (
    <Link
      to={to}
      search={{}}
      aria-current={current ? 'page' : undefined}
      className={cn(
        'hover:text-foreground',
        current ? 'font-medium text-foreground' : 'text-muted-foreground',
      )}
    >
      {children}
    </Link>
  )
}

function MobileNav() {
  const session = useSession()
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={m.nav_menu()}
        >
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuItem
          onSelect={() => void navigate({ to: '/', search: {} })}
        >
          {m.nav_home()}
        </DropdownMenuItem>
        {session?.user.role === 'BIDDER' && (
          <>
            <DropdownMenuItem
              onSelect={() => void navigate({ to: '/wallet', search: {} })}
            >
              {m.nav_wallet()}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => void navigate({ to: '/me/bids', search: {} })}
            >
              {m.nav_bids()}
            </DropdownMenuItem>
          </>
        )}
        {session?.user.role === 'AUCTIONEER' && (
          <DropdownMenuItem
            onSelect={() => void navigate({ to: '/seller', search: {} })}
          >
            {m.nav_seller()}
          </DropdownMenuItem>
        )}
        {!session && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() =>
                void navigate({
                  to: '/login',
                  search: { redirect: undefined },
                })
              }
            >
              {m.nav_login()}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                void navigate({
                  to: '/register',
                  search: { redirect: undefined },
                })
              }
            >
              {m.nav_register()}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
