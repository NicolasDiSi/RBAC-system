import 'server-only';
import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';
import redis from '@/lib/services/redis';

const COOKIE_NAME = 'app_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  email: string;
  roleId: string | null;
  createdAt: string;
  device: string | null;
  ip: string | null;
  location: string | null;
}

/**
 * Creates a session by setting a cookie and storing the session in Redis.
 * To be used in API Routes or Server Actions.
 */
export async function createSession(userId: string, email: string, roleId: string | null) {
  const sessionId = crypto.randomUUID();
  const requestHeaders = await headers()

  const sessionPayload: SessionPayload = {
    userId,
    email,
    roleId,
    createdAt: new Date().toISOString(),
    ip: requestHeaders.get('x-forwarded-for') ?? '127.0.0.1',
    device: requestHeaders.get('user-agent') ?? null,
    location: null, // Location would require a Geo-IP service
  };

  const multi = redis.multi();
  multi.set(`session:${sessionId}`, JSON.stringify(sessionPayload), 'EX', SESSION_DURATION_SECONDS);
  multi.sadd(`user_sessions:${userId}`, sessionId);
  await multi.exec();

  (await cookies()).set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DURATION_SECONDS,
    sameSite: 'lax',
    path: '/',
  });
}



/**
 * Retrieves the session payload from Redis based on the session ID from the cookie.
 * This version is for Middleware, as it reads from the request object.
 */
export async function getSessionFromMiddleware(request: NextRequest): Promise<SessionPayload | null> {
  const sessionId = request.cookies.get(COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  const sessionData = await redis.get(`session:${sessionId}`);
  if (!sessionData) {
    return null;
  }

  // Optional: Refresh the session expiration on activity
  await redis.expire(`session:${sessionId}`, SESSION_DURATION_SECONDS);

  return JSON.parse(sessionData) as SessionPayload;
}

/**
 * Retrieves the session payload from Redis based on the session ID from the cookie.
 * This version is for Server Components and API Routes, as it uses `next/headers`.
 */
export async function getSessionFromCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(COOKIE_NAME)?.value

  if (!sessionId) {
    return null
  }

  const sessionData = await redis.get(`session:${sessionId}`)
  if (!sessionData) {
    return null
  }

  // Optional: Refresh the session expiration on activity
  await redis.expire(`session:${sessionId}`, SESSION_DURATION_SECONDS)

  return JSON.parse(sessionData) as SessionPayload
}

/**
 * Deletes the session from Redis and clears the cookie.
 * To be used in API Routes or Server Actions.
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;

  if (sessionId) {
    const sessionData = await redis.get(`session:${sessionId}`);
    const payload = sessionData ? (JSON.parse(sessionData) as SessionPayload) : null;
    await redis.del(`session:${sessionId}`);
    if (payload) await redis.srem(`user_sessions:${payload.userId}`, sessionId);
  }

  // Clear the cookie
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
}

/**
 * Deletes ALL active sessions for a given user from Redis.
 * This is the correct way to handle a "log out from all devices" action
 * or to invalidate sessions after a password change.
 */
export async function deleteUserSessions(userId: string) {
  const userSessionKey = `user_sessions:${userId}`;
  const sessionIds = await redis.smembers(userSessionKey);

  if (sessionIds.length > 0) {
    const multi = redis.multi();
    // Delete each individual session
    sessionIds.forEach(id => multi.del(`session:${id}`));
    // Delete the user's session set
    multi.del(userSessionKey);
    await multi.exec();
  }
}