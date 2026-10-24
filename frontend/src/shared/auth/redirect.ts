const PRIVATE_PREFIXES = ['/wallet', '/me', '/seller']

export function isPrivatePath(path: string) {
  return PRIVATE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  )
}

/** Only same-origin relative paths; rejects protocol-relative `//evil`. */
export function safeRedirect(value: unknown) {
  if (typeof value !== 'string') return undefined
  if (!value.startsWith('/') || value.startsWith('//')) return undefined
  return value
}
