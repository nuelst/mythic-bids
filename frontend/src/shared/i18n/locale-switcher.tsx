import { Languages } from 'lucide-react'
import { m } from '#/paraglide/messages'
import { getLocale, locales, setLocale } from '#/paraglide/runtime'
import { Button } from '#/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '#/shared/ui/dropdown-menu'

const LABELS = {
  pt: m.locale_pt,
  en: m.locale_en,
} satisfies Record<(typeof locales)[number], () => string>

function LocaleSwitcher() {
  const locale = getLocale()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={m.locale_label()}>
          <Languages aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => setLocale(value as typeof locale)}
        >
          {locales.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {LABELS[option]()}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { LocaleSwitcher }
