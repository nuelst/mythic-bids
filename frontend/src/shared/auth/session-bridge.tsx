import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { queryKeys } from '#/shared/api/query-keys'
import { isPrivatePath } from './redirect'
import { subscribeUnauthorized } from './session'

/** On an expired token, drop the cached user and send private routes back to login. */
export function SessionBridge() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  useEffect(() => {
    return subscribeUnauthorized(() => {
      queryClient.removeQueries({ queryKey: queryKeys.me() })
      const path = window.location.pathname
      if (!isPrivatePath(path)) return
      void navigate({
        to: '/login',
        search: { redirect: path + window.location.search },
      })
    })
  }, [navigate, queryClient])

  return null
}
