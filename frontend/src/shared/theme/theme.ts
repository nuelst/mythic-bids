export const THEMES = ['light', 'dark'] as const
export type Theme = (typeof THEMES)[number]

const COOKIE = 'theme'
const COOKIE_PATTERN = `(?:^|; )${COOKIE}=(light|dark|system)`

function resolveTheme(value: string | undefined): Theme {
  if (value === 'dark' || value === 'light') return value
  if (value === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
  return 'light'
}

/**
 * Runs inline in <head> before the first paint, so the page never flashes the wrong theme
 * (the server cannot know the preference). Old "system" cookies still resolve once.
 */
export const themeScript = `(() => {
  const saved = document.cookie.match(new RegExp('${COOKIE_PATTERN}'))?.[1];
  const dark = saved === 'dark' || (saved === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
})()`

export function readThemeCookie(): Theme {
  const value = document.cookie.match(new RegExp(COOKIE_PATTERN))?.[1]
  const theme = resolveTheme(value)
  if (value === 'system') applyTheme(theme)
  return theme
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.cookie = `${COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`
}
