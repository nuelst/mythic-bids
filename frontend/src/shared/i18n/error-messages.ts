import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import type { ErrorCode } from '#/shared/api/error-code'
import { isErrorCode } from '#/shared/api/error-code'
import { formatCents } from '#/shared/lib/money'

export interface ErrorParams {
  minimumCents?: number
}

const errorMessages = {
  EMAIL_TAKEN: () => m.error_email_taken(),
  INVALID_CREDENTIALS: () => m.error_invalid_credentials(),
  CATALOG_ITEM_NOT_FOUND: () => m.error_catalog_item_not_found(),
  INVALID_SCHEDULE: () => m.error_invalid_schedule(),
  LOT_NOT_FOUND: () => m.error_lot_not_found(),
  LOT_NOT_CANCELLABLE: () => m.error_lot_not_cancellable(),
  LOT_NOT_STARTED: () => m.error_lot_not_started(),
  LOT_CLOSED: () => m.error_lot_closed(),
  ALREADY_WINNING: () => m.error_already_winning(),
  BELOW_MINIMUM: ({ minimumCents } = {}) =>
    minimumCents == null
      ? m.error_below_minimum_plain()
      : m.error_below_minimum({
          amount: formatCents(minimumCents, getLocale()),
        }),
  INSUFFICIENT_FUNDS: () => m.error_insufficient_funds(),
  RECEIPT_NOT_FOUND: () => m.error_receipt_not_found(),
  IDEMPOTENCY_KEY_REQUIRED: () => m.error_idempotency_key_required(),
  IDEMPOTENCY_KEY_INVALID: () => m.error_idempotency_key_invalid(),
  IDEMPOTENCY_KEY_REUSED: () => m.error_idempotency_key_reused(),
  REQUEST_IN_PROGRESS: () => m.error_request_in_progress(),
} satisfies Record<ErrorCode, (params?: ErrorParams) => string>

export function errorMessage(code: string, params?: ErrorParams) {
  return isErrorCode(code) ? errorMessages[code](params) : m.error_unknown()
}
