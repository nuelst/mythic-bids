import {
  auditIssueCodes,
  auditIssueText,
  catalogAssetUrl,
  shortHash,
} from './receipt-view'
import { AUDIT_ISSUE_CODES } from './receipt-api'

describe('receipt view', () => {
  it('builds an absolute catalog image URL', () => {
    expect(
      catalogAssetUrl('/catalog/items/1/image', 'https://api.example'),
    ).toBe('https://api.example/catalog/items/1/image')
    expect(catalogAssetUrl('https://cdn.example/a.png')).toBe(
      'https://cdn.example/a.png',
    )
  })

  it('shortens a hash and leaves a short value alone', () => {
    expect(shortHash('abcdefghijklmnop', 4)).toBe('abcd…mnop')
    expect(shortHash('short')).toBe('short')
  })

  it('covers every audit issue code', () => {
    expect(auditIssueCodes()).toEqual([...AUDIT_ISSUE_CODES])
    for (const code of AUDIT_ISSUE_CODES) {
      expect(auditIssueText({ code, seq: 2 }).length).toBeGreaterThan(0)
    }
  })
})
