'use server'

import { getSupabaseServerClient } from '@/lib/services/supabase/server'
import { SignupCode } from '@/lib/data/types/database'

// Helper to generate a 6-digit alphanumeric code
async function generateUniqueSixDigitCode(): Promise<string> {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  let isUnique = false
  const supabase = await getSupabaseServerClient()

  while (!isUnique) {
    result = ''
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    const { data: existingCode } = await supabase
      .from('signup_codes')
      .select('id')
      .eq('code', result)
      .single()
    if (!existingCode) {
      isUnique = true
    }
  }
  return result
}

export async function createSignupCode(
  userId: string,
  expirationDuration: string // e.g., '1h', '24h', '7d'
): Promise<SignupCode> {
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

  const uniqueCode = await generateUniqueSixDigitCode();

  const { data, error } = await supabase
    .from('signup_codes')
    .insert({
      user_id: userId,
      code: uniqueCode,
      expires_at: expiresAt.toISOString(),
    })
    .select('*')
    .single()

  if (error) {
    console.error('Error creating signup code:', error)
    throw new Error('Failed to create signup code.')
  }

  return data as SignupCode
}

export async function markSignupCodeAsUsed(codeId: string): Promise<void> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('signup_codes')
    .update({ is_used: true, updated_at: new Date().toISOString() })
    .eq('id', codeId)

  if (error) {
    console.error('Error marking signup code as used:', error)
    throw new Error('Failed to mark signup code as used.')
  }
}
