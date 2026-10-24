import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { applyTheme, readThemeCookie } from './theme'
import type { Theme } from './theme'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => setThemeState(readThemeCookie()), [])

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next)
    setThemeState(next)
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])
  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside ThemeProvider')
  return context
}
