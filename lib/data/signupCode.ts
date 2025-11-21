import { getSupabaseServerClient } from '@/lib/services/supabase/server'
import { SignupCode } from '@/lib/data/types/database'

export async function getSignupCodeByCode(code: string): Promise<SignupCode | null> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('signup_codes')
    .select('*')
    .eq('code', code)
    .single()

  if (error) {
    console.error('Error fetching signup code by code:', error)
    return null
  }
  return data as SignupCode
}

export async function getSignupCodeByUserId(userId: string): Promise<SignupCode | null> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('signup_codes')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching signup code by user ID:', error)
    return null
  }
  return data as SignupCode
}
