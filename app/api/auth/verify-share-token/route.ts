import { NextResponse } from 'next/server';
import { getShareTokenByToken } from '@/lib/data/shareToken';
import { markShareTokenAsUsed } from '@/app/actions/shareToken';
import { getUserById } from '@/lib/data/user';
import { createSession } from '@/lib/services/auth/session';

export async function POST(request: Request) {
  try {
    const { token, clientTimezone } = await request.json();

    if (!token) {
      return NextResponse.json({ message: 'Token is required' }, { status: 400 });
    }

    const shareToken = await getShareTokenByToken(token);

    if (!shareToken) {
      return NextResponse.json({ message: 'Invalid share link' }, { status: 404 });
    }

    if (shareToken.is_used) {
      return NextResponse.json({ message: 'Share link has already been used' }, { status: 409 });
    }

    if (new Date(shareToken.expires_at) < new Date()) {
      return NextResponse.json({ message: 'Share link has expired' }, { status: 410 });
    }

    // Region restriction check (simplified for now, actual implementation needs IP geolocation)
    // For now, just check if a restriction exists and if it matches a dummy value
    if (shareToken.region_restriction) {
      // In a real scenario, you'd get the user's IP and resolve their region
      // For demonstration, let's assume a client-side region detection or a default
      const userRegion = request.headers.get('x-vercel-ip-country') || 'UNKNOWN'; // Example for Vercel
      if (shareToken.region_restriction !== userRegion) {
        return NextResponse.json({ message: 'Access denied due to region restriction' }, { status: 403 });
      }
    }

    // Timezone restriction check
    if (shareToken.timezone_restriction && shareToken.timezone_restriction !== clientTimezone) {
      return NextResponse.json({ message: 'Access denied due to timezone restriction' }, { status: 403 });
    }

    // Mark the token as used
    await markShareTokenAsUsed(shareToken.id);

    // Create a session for the user
    const user = await getUserById(shareToken.user_id);
    if (!user || !user.is_active) {
      return NextResponse.json({ message: 'Associated user not found or inactive' }, { status: 404 });
    }

    await createSession(user.id, user.email, user.role_id);

    return NextResponse.json({ message: 'Login successful', redirect: '/dashboard' }, { status: 200 });

  } catch (error) {
    console.error('Error verifying share token:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
