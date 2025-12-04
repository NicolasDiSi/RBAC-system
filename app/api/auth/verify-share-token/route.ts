import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/services/supabase/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const { token, clientTimezone } = await req.json();

  if (!token) {
    return NextResponse.json({ message: 'Share token is missing.' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = await getSupabaseServerClient(cookieStore);

  // 1. Hash the incoming token to find it in the database
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // 2. Retrieve the token from the database
  const { data: shareToken, error: tokenError } = await supabase
    .from('share_tokens')
    .select('*')
    .eq('token', hashedToken)
    .single();

  if (tokenError || !shareToken) {
    return NextResponse.json({ message: 'Invalid or expired share link.' }, { status: 404 });
  }

  // 3. Perform validation checks
  const now = new Date();
  const expiresAt = new Date(shareToken.expires_at);

  if (shareToken.is_used) {
    return NextResponse.json({ message: 'This share link has already been used.' }, { status: 410 });
  }

  if (now > expiresAt) {
    return NextResponse.json({ message: 'This share link has expired.' }, { status: 410 });
  }

  if (shareToken.timezone_restriction && shareToken.timezone_restriction !== clientTimezone) {
    return NextResponse.json(
      { message: `Access denied. This link is only valid in the ${shareToken.timezone_restriction} timezone.` },
      { status: 403 }
    );
  }

  // 4. Grant a new session for the user
  const { error: sessionError } = await supabase.auth.admin.updateUserById(shareToken.user_id, {});
  if (sessionError) {
    console.error('Error granting session:', sessionError);
    return NextResponse.json({ message: 'Failed to authenticate user.' }, { status: 500 });
  }

  // 5. Mark the token as used
  const { error: updateError } = await supabase
    .from('share_tokens')
    .update({ is_used: true, updated_at: new Date().toISOString() })
    .eq('id', shareToken.id);

  if (updateError) {
    console.error('Error marking token as used:', updateError);
    // Non-critical error, proceed with login
  }

  return NextResponse.json({ message: 'Logged in successfully!', redirect: '/dashboard' });
}