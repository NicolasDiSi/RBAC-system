
import 'server-only'
import { cache } from 'react'
import { getSessionFromCookie } from '@/lib/services/auth/session'
import { getUserWithRoleById } from '@/lib/data/user'

/**
 * Retrieves the authenticated user's profile from the database.
 * This is the single source of truth for the current user in Server Components.
 */
export const getAuthenticatedUser = cache(async () => {
  const session = await getSessionFromCookie()
  if (!session) {
    return null
  }

  const user = await getUserWithRoleById(session.userId);

  return user;
})
