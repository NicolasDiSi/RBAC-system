import { getSupabaseServerClient } from '@/lib/services/supabase/server'
import { ShareToken } from '@/lib/data/types/database'

export async function getShareTokenByToken(token: string): Promise<ShareToken | null> {
  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase
    .from('share_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (error) {
    console.error('Error fetching share token by token:', error)
    return null
  }
  return data as ShareToken
}
