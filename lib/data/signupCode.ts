import { getSupabaseServiceRoleClient } from '@/lib/services/supabase/server'
import { SignupCode } from '@/lib/data/types/database'
import { executeQuery } from './query' // Added executeQuery import

export const SignupCodeDAO = {
  async getByCode(code: string): Promise<SignupCode | null> {
    const supabase = await getSupabaseServiceRoleClient()
    const query = supabase
      .from('signup_codes')
      .select('*')
      .eq('code', code)
      .single()
    return executeQuery(query)
  },

  async getByUserId(userId: string): Promise<SignupCode | null> {
    const supabase = await getSupabaseServiceRoleClient()
    const query = supabase
      .from('signup_codes')
      .select('*')
      .eq('user_id', userId)
      .single()
    return executeQuery(query)
  },

  async getAll(): Promise<SignupCode[]> {
    const supabase = await getSupabaseServiceRoleClient()
    const query = supabase
      .from('signup_codes')
      .select('*')
      .order('created_at', { ascending: false })
    return executeQuery(query)
  },

  async create(signupCodeData: { user_id: string; code: string; expires_at: string }): Promise<SignupCode> {
    const supabase = await getSupabaseServiceRoleClient()
    const query = supabase
      .from('signup_codes')
      .insert(signupCodeData)
      .select()
      .single()
    return executeQuery(query)
  },

  async delete(id: string): Promise<void> {
    const supabase = await getSupabaseServiceRoleClient()
    const query = supabase
      .from('signup_codes')
      .delete()
      .eq('id', id)
    await executeQuery(query)
  },

  async markAsUsed(id: string): Promise<void> {
    const supabase = await getSupabaseServiceRoleClient()
    const query = supabase
      .from('signup_codes')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', id)
    await executeQuery(query)
  },
}

// Original functions, now using DAO
export async function getSignupCodeByCode(code: string): Promise<SignupCode | null> {
  return SignupCodeDAO.getByCode(code)
}

export async function getSignupCodeByUserId(userId: string): Promise<SignupCode | null> {
  return SignupCodeDAO.getByUserId(userId)
}

export async function getAllSignupCodes(): Promise<SignupCode[]> {
  return SignupCodeDAO.getAll()
}

export async function deleteSignupCode(id: string): Promise<void> {
  return SignupCodeDAO.delete(id)
}

export async function createSignupCode(userId: string, expirationDuration: number): Promise<SignupCode> {
  const supabase = await getSupabaseServiceRoleClient()
  const code = Math.random().toString(36).substring(2, 10).toUpperCase() // Simple random code
  const expiresAt = new Date(Date.now() + expirationDuration * 60 * 1000).toISOString() // duration in minutes

  const { data: existingUser } = await supabase.from('users').select('id').eq('id', userId).single()
  if (!existingUser) {
    throw new Error('User not found.')
  }

  return SignupCodeDAO.create({ user_id: userId, code, expires_at: expiresAt })
}

export async function markSignupCodeAsUsed(id: string): Promise<void> {
  return SignupCodeDAO.markAsUsed(id)
}