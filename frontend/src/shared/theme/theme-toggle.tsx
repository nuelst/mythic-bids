import { Moon, Sun } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { Button } from '#/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '#/shared/ui/dropdown-menu'
import { THEMES } from './theme'
import type { Theme } from './theme'
import { useTheme } from './theme-provider'

const OPTIONS = {
  light: { icon: Sun, label: m.theme_light },
  dark: { icon: Moon, label: m.theme_dark },
} satisfies Record<Theme, unknown>

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={m.theme_label()}>
          <Sun className="dark:hidden" aria-hidden />
          <Moon className="hidden dark:block" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as Theme)}
        >
          {THEMES.map((option) => {
            const { icon: Icon, label } = OPTIONS[option]
            return (
              <DropdownMenuRadioItem key={option} value={option}>
                <Icon aria-hidden />
                {label()}
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ThemeToggle }
