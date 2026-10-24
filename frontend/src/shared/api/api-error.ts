import { isErrorCode } from './error-code'
import type { ErrorCode } from './error-code'

export class ApiError extends Error {
  readonly status: number
  readonly code?: ErrorCode
  readonly minimumCents?: number

  constructor(
    status: number,
    message: string,
    code?: ErrorCode,
    minimumCents?: number,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.minimumCents = minimumCents
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

function readMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== 'object') return fallback
  const message = 'message' in body ? body.message : undefined
  if (typeof message === 'string' && message) return message
  if (Array.isArray(message) && message.length) return message.join(', ')
  return fallback
}

export async function toApiError(response: Response) {
  const body: unknown = await response.json().catch(() => null)
  const code =
    body &&
    typeof body === 'object' &&
    'code' in body &&
    typeof body.code === 'string' &&
    isErrorCode(body.code)
      ? body.code
      : undefined
  const minimumCents =
    body &&
    typeof body === 'object' &&
    'minimumCents' in body &&
    typeof body.minimumCents === 'number'
      ? body.minimumCents
      : undefined

  return new ApiError(
    response.status,
    readMessage(body, response.statusText),
    code,
    minimumCents,
  )
}
