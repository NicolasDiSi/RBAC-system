"use server";

import { getSupabaseServerClient } from '@/lib/services/supabase/server'
import crypto from 'crypto';

export async function createVerificationToken(
  userId: string,
  type: 'email_verification' | 'password_reset',
  expirationInHours: number = 24
): Promise<{ token: string }> {
  const supabase = await getSupabaseServerClient();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + expirationInHours * 60 * 60 * 1000);

  // 1. Generate a secure, URL-safe, random token
  const rawToken = crypto.randomBytes(32).toString('base64url');
  
  // 2. Hash the token for database storage
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const { error } = await supabase
    .from('verification_tokens')
    .insert({
      user_id: userId,
      token: hashedToken,
      type: type,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    console.error('Error creating verification token:', error);
    throw new Error('Failed to create verification token.');
  }

  // 3. Return the raw token to be used in the verification link
  return { token: rawToken };
}
