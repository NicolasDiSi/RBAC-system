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
  roleId: string,
  expirationInMinutes: number
): Promise<SignupCode> {
  const supabase = await getSupabaseServerClient()

  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + expirationInMinutes)

  const uniqueCode = await generateUniqueSixDigitCode();

  const { data, error } = await supabase
    .from('signup_codes')
    .insert({
      role_id: roleId,
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

export async function deleteSignupCode(codeId: string): Promise<void> {
  const supabase = await getSupabaseServerClient()

  const { error } = await supabase
    .from('signup_codes')
    .delete()
    .eq('id', codeId)

  if (error) {
    console.error('Error deleting signup code:', error)
    throw new Error('Failed to delete signup code.')
  }
}
