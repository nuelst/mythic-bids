import { z } from 'zod'
import { m } from '#/paraglide/messages'
import type { ScheduleError } from './schedule'
import { scheduleError } from './schedule'

export const MAX_AMOUNT_CENTS = 100_000_000

const amount = z
  .number({ error: m.validation_required() })
  .int()
  .positive(m.validation_amount())
  .max(MAX_AMOUNT_CENTS, m.validation_amount_max())

function scheduleMessage(error: ScheduleError) {
  if (error === 'far') return m.seller_schedule_far()
  if (error === 'past_start') return m.seller_schedule_past_start()
  if (error === 'past_end') return m.seller_schedule_past_end()
  if (error === 'before_start') return m.seller_schedule_before_start()
  return m.seller_schedule_short()
}

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
      path: [error === 'past_start' ? 'startsAt' : 'endsAt'],
      message: scheduleMessage(error),
    })
  })

export type CreateLotValues = z.infer<typeof createLotSchema>
