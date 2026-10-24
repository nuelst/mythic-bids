export const THEMES = ['light', 'dark', 'system'] as const
export type Theme = (typeof THEMES)[number]

const COOKIE = 'theme'
const COOKIE_PATTERN = `(?:^|; )${COOKIE}=(light|dark|system)`

/**
 * Runs inline in <head> before the first paint, so the page never flashes the wrong theme
 * (the server cannot know the system preference).
 */
export const themeScript = `(() => {
  const saved = document.cookie.match(new RegExp('${COOKIE_PATTERN}'))?.[1] ?? 'system';
  const dark = saved === 'dark' || (saved === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
})()`

export function readThemeCookie(): Theme {
  const value = document.cookie.match(new RegExp(COOKIE_PATTERN))?.[1]
  return (value as Theme | undefined) ?? 'system'
}

export function applyTheme(theme: Theme) {
  const dark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
  document.cookie = `${COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`
}
