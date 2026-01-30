import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db';
import { shareTokens, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createSession } from '@/lib/services/auth/session';

export async function POST(req: NextRequest) {
  const { token, clientTimezone } = await req.json();

  if (!token) {
    return NextResponse.json({ message: 'Share token is missing.' }, { status: 400 });
  }

  const db = await getDb();

  // 1. Hash the incoming token to find it in the database
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // 2. Retrieve the token from the database
  const [data] = await db
    .select({
      shareToken: shareTokens,
      user: users,
    })
    .from(shareTokens)
    .innerJoin(users, eq(shareTokens.userId, users.id))
    .where(eq(shareTokens.token, hashedToken))
    .limit(1);

  if (!data) {
    return NextResponse.json({ message: 'Invalid or expired share link.' }, { status: 404 });
  }

  const { shareToken, user } = data;

  // 3. Perform validation checks
  const now = new Date();
  const expiresAt = new Date(shareToken.expiresAt);

  if (shareToken.isUsed) {
    return NextResponse.json({ message: 'This share link has already been used.' }, { status: 410 });
  }

  if (now > expiresAt) {
    return NextResponse.json({ message: 'This share link has expired.' }, { status: 410 });
  }

  if (shareToken.timezoneRestriction && shareToken.timezoneRestriction !== clientTimezone) {
    return NextResponse.json(
      { message: `Access denied. This link is only valid in the ${shareToken.timezoneRestriction} timezone.` },
      { status: 403 }
    );
  }

  // 4. Grant a new session for the user
  try {
    await createSession(user.id, user.email, user.roleId);
  } catch (error) {
    console.error('Error granting session:', error);
    return NextResponse.json({ message: 'Failed to authenticate user.' }, { status: 500 });
  }

  // 5. Mark the token as used
  try {
    await db
      .update(shareTokens)
      .set({ isUsed: true, updatedAt: new Date() })
      .where(eq(shareTokens.id, shareToken.id));
  } catch (updateError) {
    console.error('Error marking token as used:', updateError);
    // Non-critical error, proceed with login
  }

  return NextResponse.json({ message: 'Logged in successfully!', redirect: '/dashboard' });
}