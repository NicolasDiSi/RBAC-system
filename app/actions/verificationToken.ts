"use server";

import crypto from 'crypto';
import { createToken, NewVerificationToken } from '@/lib/data/verificationToken';

export async function createVerificationToken(
  userId: string,
  type: 'email_verification' | 'password_reset',
  expirationInHours: number = 24
): Promise<{ token: string }> {

  const now = new Date();
  const expiresAt = new Date(now.getTime() + expirationInHours * 60 * 60 * 1000);

  // 1. Generate a secure, URL-safe, random token
  const rawToken = crypto.randomBytes(32).toString('base64url');
  
  // 2. Hash the token for database storage
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const tokenData: NewVerificationToken = {
    userId: userId,
    token: hashedToken,
    type: type,
    expiresAt: expiresAt,
  };

  await createToken(tokenData);

  // 3. Return the raw token to be used in the verification link
  return { token: rawToken };
}