import { z } from 'zod'
import { m } from '#/paraglide/messages'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, m.validation_required())
    .max(254)
    .email(m.validation_email()),
  password: z
    .string()
    .min(8, m.validation_password())
    .max(72, m.validation_password()),
})

export const registerSchema = loginSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, m.validation_name())
    .max(80, m.validation_name()),
  role: z.enum(['AUCTIONEER', 'BIDDER']),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
