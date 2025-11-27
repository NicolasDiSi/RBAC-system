"use server";

import { getSupabaseServerClient } from '@/lib/services/supabase/server'
import { ShareToken } from '@/lib/data/types/database'
import crypto from 'crypto';
import { checkPermission } from '@/lib/services/auth/permissions';

export async function createShareToken(
  userId: string,
  expirationDuration: string, // e.g., '1h', '24h', '7d'
  regionRestriction: string | null = null,
  timezoneRestriction: string | null = null
): Promise<ShareToken> {
  const hasAccess = await checkPermission('users.generate_share_link');
  if (!hasAccess) {
    throw new Error('You do not have permission to create share tokens.');
  }

  const supabase = await getSupabaseServerClient()

  // Calculate expires_at
  const now = new Date()
  let expiresAt = new Date(now)

  const durationValue = parseInt(expirationDuration.slice(0, -1))
  const durationUnit = expirationDuration.slice(-1)

  switch (durationUnit) {
    case 'h':
      expiresAt.setHours(now.getHours() + durationValue)
      break
    case 'd':
      expiresAt.setDate(now.getDate() + durationValue)
      break
    // Add more cases as needed (e.g., 'm' for minutes)
    default:
      throw new Error('Invalid expiration duration unit. Use h or d.')
  }

  const token = crypto.randomUUID(); // Generate a UUID for the token using webcrypto

  const { data, error } = await supabase
    .from('share_tokens')
    .insert({
      user_id: userId,
      token: token,
      expires_at: expiresAt.toISOString(),
      region_restriction: regionRestriction,
      timezone_restriction: timezoneRestriction,
    })
    .select('*')
    .single()

  if (error) {
    console.error('Error creating share token:', error)
    throw new Error('Failed to create share token.')
  }

  return data as ShareToken
}

export async function markShareTokenAsUsed(tokenId: string): Promise<void> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('share_tokens')
    .update({ is_used: true, updated_at: new Date().toISOString() })
    .eq('id', tokenId)

  if (error) {
    console.error('Error marking share token as used:', error)
    throw new Error('Failed to mark share token as used.')
  }
}
