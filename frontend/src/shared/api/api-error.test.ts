import { ApiError, isApiError, toApiError } from './api-error'

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    statusText: 'Error',
    headers: { 'content-type': 'application/json' },
  })
}

describe('toApiError', () => {
  it('reads the code, message and minimumCents', async () => {
    const error = await toApiError(
      jsonResponse(422, {
        statusCode: 422,
        code: 'BELOW_MINIMUM',
        message: 'too low',
        minimumCents: 15000,
      }),
    )

    expect(error).toBeInstanceOf(ApiError)
    expect(isApiError(error)).toBe(true)
    expect(error.status).toBe(422)
    expect(error.code).toBe('BELOW_MINIMUM')
    expect(error.message).toBe('too low')
    expect(error.minimumCents).toBe(15000)
  })

  it('joins validation messages', async () => {
    const error = await toApiError(
      jsonResponse(400, { message: ['email must be an email', 'too short'] }),
    )
    expect(error.message).toBe('email must be an email, too short')
    expect(error.code).toBeUndefined()
  })

  it('ignores unknown codes', async () => {
    const error = await toApiError(
      jsonResponse(500, { code: 'NOT_A_REAL_CODE', message: 'boom' }),
    )
    expect(error.code).toBeUndefined()
    expect(error.message).toBe('boom')
  })
})
