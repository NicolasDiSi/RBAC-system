import 'server-only'
import { cache } from 'react'
import { getSessionFromCookie } from '@/lib/services/auth/session'
import { getSupabaseServerClient } from '@/lib/services/supabase/server'

/**
 * Retrieves the authenticated user's profile from the database.
 * This is the single source of truth for the current user in Server Components.
 */
export const getAuthenticatedUser = cache(async () => {
  const session = await getSessionFromCookie()
  if (!session) {
    return null
  }

  const supabase = await getSupabaseServerClient()

  // Get user with role information
  const { data: user } = await supabase
    .from('users')
    .select(`
      *,
      role:roles(*)
    `)
    .eq('id', session.userId)
    .single()

  return user
})