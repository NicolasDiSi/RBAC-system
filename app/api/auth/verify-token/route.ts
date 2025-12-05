import { NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/services/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url));
  }

  const supabase = await getSupabaseServiceRoleClient();

  // 1. Verify the token
  const { data: verificationToken, error: tokenError } = await supabase
    .from('verification_tokens')
    .select('*')
    .eq('token', token)
    .eq('type', 'email_verification')
    .single();

  if (tokenError || !verificationToken) {
    console.error('Token verification error:', tokenError);
    return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url));
  }

  if (verificationToken.is_used) {
    return NextResponse.redirect(new URL('/auth/login?error=token_already_used', request.url));
  }

  if (new Date(verificationToken.expires_at) < new Date()) {
    return NextResponse.redirect(new URL('/auth/login?error=token_expired', request.url));
  }

  // 2. Mark the token as used
  const { error: updateTokenError } = await supabase
    .from('verification_tokens')
    .update({ is_used: true, updated_at: new Date().toISOString() })
    .eq('id', verificationToken.id);

  if (updateTokenError) {
    console.error('Error marking token as used:', updateTokenError);
    return NextResponse.redirect(new URL('/auth/login?error=server_error', request.url));
  }

  // 3. Update the user's verified_at status
  const { error: updateUserError } = await supabase
    .from('users')
    .update({ verified_at: new Date().toISOString() })
    .eq('id', verificationToken.user_id);

  if (updateUserError) {
    console.error('Error updating user verified_at:', updateUserError);
    return NextResponse.redirect(new URL('/auth/login?error=server_error', request.url));
  }

  // 4. Redirect to login page with success message
  return NextResponse.redirect(new URL('/auth/login?message=email_verified', request.url));
}
