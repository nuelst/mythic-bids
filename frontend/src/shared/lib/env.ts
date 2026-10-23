import { z } from 'zod'

const schema = z.object({
  VITE_API_URL: z.url().default('http://localhost:3000'),
})

const parsed = schema.parse(import.meta.env)

/** Base URL of the auction API, without a trailing slash. */
export const API_URL = parsed.VITE_API_URL.replace(/\/$/, '')
