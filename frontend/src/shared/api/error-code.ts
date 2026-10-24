/** Mirrors the API `ErrorCode` enum. Phase 4 will replace this with the OpenAPI type. */
export const ERROR_CODES = [
  'EMAIL_TAKEN',
  'INVALID_CREDENTIALS',
  'CATALOG_ITEM_NOT_FOUND',
  'INVALID_SCHEDULE',
  'LOT_NOT_FOUND',
  'LOT_NOT_CANCELLABLE',
  'LOT_NOT_STARTED',
  'LOT_CLOSED',
  'ALREADY_WINNING',
  'BELOW_MINIMUM',
  'INSUFFICIENT_FUNDS',
  'RECEIPT_NOT_FOUND',
  'IDEMPOTENCY_KEY_REQUIRED',
  'IDEMPOTENCY_KEY_INVALID',
  'IDEMPOTENCY_KEY_REUSED',
  'REQUEST_IN_PROGRESS',
] as const

export type ErrorCode = (typeof ERROR_CODES)[number]

export function isErrorCode(value: string): value is ErrorCode {
  return (ERROR_CODES as readonly string[]).includes(value)
}
