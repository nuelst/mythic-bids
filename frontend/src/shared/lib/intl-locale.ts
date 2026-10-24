/** Maps app locales (`pt`, `en`) to the Intl locale used for money, dates and relative time. */
export function intlLocale(locale: string) {
  if (locale === 'pt') return 'pt-BR'
  if (locale === 'en') return 'en-US'
  return locale
}
