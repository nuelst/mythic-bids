import { api } from '#/shared/api/client'
import { ApiError } from '#/shared/api/api-error'
import type { LoginValues, RegisterValues } from './schemas'

export async function login(body: LoginValues) {
  const { data } = await api.POST('/auth/login', { body })
  if (!data) throw new ApiError(500, 'Empty response')
  return data
}

export async function register(body: RegisterValues) {
  const { data } = await api.POST('/auth/register', { body })
  if (!data) throw new ApiError(500, 'Empty response')
  return data
}
