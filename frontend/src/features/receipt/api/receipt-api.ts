import { queryOptions } from '@tanstack/react-query'
import { api } from '#/shared/api/client'
import { ApiError, toApiError } from '#/shared/api/api-error'
import { queryKeys } from '#/shared/api/query-keys'
import { API_URL } from '#/shared/lib/env'
import type { components } from '#/shared/api/schema'

export type Receipt = components['schemas']['ReceiptDto']
export type AuditReport = components['schemas']['AuditReportDto']
export type AuditIssue = components['schemas']['AuditIssueDto']
export type AuditBid = components['schemas']['AuditBidDto']
export type AuditIssueCode = AuditIssue['code']

export const AUDIT_ISSUE_CODES = [
  'GENESIS_TAMPERED',
  'SEQUENCE_GAP',
  'BROKEN_LINK',
  'HASH_MISMATCH',
  'INVALID_SIGNATURE',
  'RULE_VIOLATION',
  'HEAD_MISMATCH',
  'SEAL_MISMATCH',
] as const satisfies readonly AuditIssueCode[]

export async function fetchReceipt(token: string): Promise<Receipt> {
  const { data } = await api.GET('/receipts/{token}', {
    params: { path: { token } },
  })
  if (!data) throw new ApiError(500, 'Empty response')
  return data
}

export async function fetchAudit(lotId: string): Promise<AuditReport> {
  const { data } = await api.GET('/audit/lots/{id}', {
    params: { path: { id: lotId } },
  })
  if (!data) throw new ApiError(500, 'Empty response')
  return data
}

export async function fetchPublicKey(): Promise<string> {
  const response = await fetch(`${API_URL}/audit/public-key`)
  if (!response.ok) throw await toApiError(response)
  const pem = await response.text()
  if (!pem) throw new ApiError(500, 'Empty response')
  return pem
}

export function receiptQueryOptions(token: string) {
  return queryOptions({
    queryKey: queryKeys.receipt(token),
    queryFn: () => fetchReceipt(token),
  })
}

export function auditQueryOptions(lotId: string) {
  return queryOptions({
    queryKey: queryKeys.audit(lotId),
    queryFn: () => fetchAudit(lotId),
    enabled: Boolean(lotId),
  })
}

export function publicKeyQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.auditPublicKey(),
    queryFn: fetchPublicKey,
    staleTime: Infinity,
  })
}
