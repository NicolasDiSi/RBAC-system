'use server'

import { getSupabaseServerClient } from '@/lib/services/supabase/server'
import { hash } from 'bcrypt'

export async function updateUserPassword(userId: string, newPasswordPlain: string): Promise<void> {
  const supabase = await getSupabaseServerClient()

  const hashedPassword = await hash(newPasswordPlain, 12)

  const { error } = await supabase
    .from('users')
    .update({ hashed_password: hashedPassword, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) {
    console.error('Error updating user password:', error)
    throw new Error('Failed to update user password.')
  }
}

export async function linkGoogleAccountToUser(
  userId: string,
  googleId: string,
  googleEmail: string,
  googleName: string,
  googleAvatarUrl: string | null
): Promise<void> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('users')
    .update({
      google_id: googleId,
      email: googleEmail, // Update email if Google provides a different one or if it's the first time
      name: googleName,
      avatar_url: googleAvatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error linking Google account to user:', error)
    throw new Error('Failed to link Google account to user.')
  }
}
