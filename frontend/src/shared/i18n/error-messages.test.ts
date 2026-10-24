import { ERROR_CODES } from '#/shared/api/error-code'
import { errorMessage } from './error-messages'

const normalize = (text: string) => text.replace(/\s/g, ' ')

describe('errorMessage', () => {
  it('has a non-empty message for every ErrorCode', () => {
    for (const code of ERROR_CODES) {
      expect(errorMessage(code).length).toBeGreaterThan(0)
    }
  })

  it('interpolates the minimum bid amount', () => {
    expect(
      normalize(errorMessage('BELOW_MINIMUM', { minimumCents: 125000 })),
    ).toBe('O lance mínimo é R$ 1.250,00.')
  })

  it('falls back when the code is unknown', () => {
    expect(errorMessage('NOT_A_REAL_CODE')).toBe(
      'Algo correu mal. Tenta novamente.',
    )
  })
})
