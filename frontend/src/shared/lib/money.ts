import { intlLocale } from './intl-locale'

/** Amounts travel as integer cents (like the API); this module is the only place that formats them. */

export function formatCents(cents: number, locale: string) {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

/** "1234567" → "12.345,67" (pt) — the editable part of a money input, without the currency. */
export function formatCentsPlain(cents: number, locale: string) {
  return new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

/** Reads typed text as cents by keeping only digits: "R$ 1.234,5" → 12345. */
export function parseCents(text: string): number | null {
  const digits = text.replace(/\D/g, '')
  return digits ? Number(digits) : null
}
