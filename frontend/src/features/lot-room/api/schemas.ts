import { z } from 'zod'
import { m } from '#/paraglide/messages'

export const MAX_AMOUNT_CENTS = 100_000_000

export const bidSchema = z.object({
  amountCents: z
    .number({ error: m.validation_required() })
    .int()
    .positive(m.validation_amount())
    .max(MAX_AMOUNT_CENTS, m.validation_amount_max()),
})

export type BidValues = z.infer<typeof bidSchema>
