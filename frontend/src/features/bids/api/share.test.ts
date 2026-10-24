import { canWebShare, receiptPath, receiptUrl } from './share'

describe('receipt share', () => {
  it('builds a public path that encodes the token', () => {
    expect(receiptPath('abc+def')).toBe('/receipts/abc%2Bdef')
    expect(receiptUrl('tok', 'https://app.example')).toBe(
      'https://app.example/receipts/tok',
    )
  })

  it('detects when Web Share is missing', () => {
    expect(canWebShare({ url: 'https://app.example/receipts/tok' })).toBe(false)
  })
})
