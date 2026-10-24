import { m } from '#/paraglide/messages'
import { getLocale } from '#/paraglide/runtime'
import { API_URL } from '#/shared/lib/env'
import { formatCents } from '#/shared/lib/money'
import type { AuditIssue, AuditIssueCode, Receipt } from './receipt-api'

export function catalogAssetUrl(path: string, base = API_URL) {
  if (/^https?:\/\//.test(path)) return path
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function shortHash(value: string, edge = 8) {
  if (value.length <= edge * 2 + 1) return value
  return `${value.slice(0, edge)}…${value.slice(-edge)}`
}

export function auditIssueText(issue: AuditIssue): string {
  const seq = issue.seq ?? 0
  switch (issue.code) {
    case 'GENESIS_TAMPERED':
      return m.audit_issue_genesis()
    case 'SEQUENCE_GAP':
      return m.audit_issue_sequence({ seq })
    case 'BROKEN_LINK':
      return m.audit_issue_link({ seq })
    case 'HASH_MISMATCH':
      return m.audit_issue_hash({ seq })
    case 'INVALID_SIGNATURE':
      return m.audit_issue_signature({ seq })
    case 'RULE_VIOLATION':
      return m.audit_issue_rule({ seq })
    case 'HEAD_MISMATCH':
      return m.audit_issue_head()
    case 'SEAL_MISMATCH':
      return m.audit_issue_seal()
  }
}

export function receiptHeadMeta(receipt: Receipt) {
  const amount = formatCents(receipt.amountCents, getLocale())
  const title = m.receipt_og_title({ name: receipt.lot.item.name })
  const description = m.receipt_og_description({
    name: receipt.lot.item.name,
    amount,
    alias: receipt.winnerAlias,
  })
  const image = catalogAssetUrl(receipt.lot.item.imageUrl)
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: image },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ]
}

const ALL_CODES: AuditIssueCode[] = [
  'GENESIS_TAMPERED',
  'SEQUENCE_GAP',
  'BROKEN_LINK',
  'HASH_MISMATCH',
  'INVALID_SIGNATURE',
  'RULE_VIOLATION',
  'HEAD_MISMATCH',
  'SEAL_MISMATCH',
]

/** Used by tests to keep the issue map exhaustive. */
export function auditIssueCodes() {
  return ALL_CODES
}
