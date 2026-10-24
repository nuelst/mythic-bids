import { formatCents, formatCentsPlain, parseCents } from './money'

// Intl uses a non-breaking space between the symbol and the value.
const normalize = (text: string) => text.replace(/\s/g, ' ')

describe('money', () => {
  it('formats cents as BRL for each locale', () => {
    expect(normalize(formatCents(123456, 'pt'))).toBe('R$ 1.234,56')
    expect(normalize(formatCents(123456, 'en'))).toBe('R$1,234.56')
  })

  it('formats the editable part without the currency', () => {
    expect(formatCentsPlain(5, 'pt')).toBe('0,05')
    expect(formatCentsPlain(1000000, 'pt')).toBe('10.000,00')
  })

  it('parses typed text as cents from its digits', () => {
    expect(parseCents('R$ 1.234,56')).toBe(123456)
    expect(parseCents('12345')).toBe(12345)
    expect(parseCents('')).toBeNull()
    expect(parseCents('abc')).toBeNull()
  })
})
