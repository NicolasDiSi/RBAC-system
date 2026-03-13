import { NextResponse } from 'next/server';
import { getVerificationTokenByToken, markVerificationTokenAsUsed } from '@/lib/data/verificationToken';
import { updateUserVerificationStatus } from '@/lib/data/user';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url));
  }

  try {
    // 1. Verify the token
    const verificationToken = await getVerificationTokenByToken(token);

    if (!verificationToken || verificationToken.type !== 'email_verification') {
      return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url));
    }

    if (verificationToken.isUsed) {
      return NextResponse.redirect(new URL('/auth/login?error=token_already_used', request.url));
    }

    if (new Date(verificationToken.expiresAt) < new Date()) {
      return NextResponse.redirect(new URL('/auth/login?error=token_expired', request.url));
    }

    // 2. Mark the token as used
    await markVerificationTokenAsUsed(verificationToken.id);

    // 3. Update the user's verified_at status
    await updateUserVerificationStatus(verificationToken.userId);

    // 4. Redirect to login page with success message
    return NextResponse.redirect(new URL('/auth/login?message=email_verified', request.url));
    
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=server_error', request.url));
  }
}