import { z } from 'zod'
import { m } from '#/paraglide/messages'
import { scheduleError } from './schedule'

export const MAX_AMOUNT_CENTS = 100_000_000

const amount = z
  .number({ error: m.validation_required() })
  .int()
  .positive(m.validation_amount())
  .max(MAX_AMOUNT_CENTS, m.validation_amount_max())

export const createLotSchema = z
  .object({
    itemId: z.string().min(1, m.seller_pick_item()),
    startingPriceCents: amount,
    minIncrementCents: amount,
    startsAt: z.string().optional(),
    endsAt: z.string().min(1, m.validation_required()),
  })
  .superRefine((values, ctx) => {
    const error = scheduleError(values.startsAt, values.endsAt)
    if (!error) return
    ctx.addIssue({
      code: 'custom',
      path: ['endsAt'],
      message:
        error === 'far' ? m.seller_schedule_far() : m.seller_schedule_short(),
    })
  })

export type CreateLotValues = z.infer<typeof createLotSchema>
