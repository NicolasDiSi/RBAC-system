
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { shareTokens } from '../db/schema';
import crypto from 'crypto';

export type ShareToken = typeof shareTokens.$inferSelect;
export type NewShareToken = typeof shareTokens.$inferInsert;

export async function getShareTokenByToken(token: string): Promise<ShareToken | undefined> {
  const db = await getDb();
  return db.query.shareTokens.findFirst({
    where: eq(shareTokens.token, token),
  });
}

export async function createShareToken(
  userId: string,
  expirationDurationMinutes: number
): Promise<ShareToken> {
  const db = await getDb();
  
  // 1. Generate a secure, URL-safe, random token
  const rawToken = crypto.randomBytes(32).toString('base64url');
  // 2. Hash the token for database storage
  const token = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + expirationDurationMinutes * 60 * 1000);

  const newShareToken: NewShareToken = {
    token,
    userId,
    expiresAt,
  };

  const [createdToken] = await db.insert(shareTokens).values(newShareToken).returning();
  return createdToken;
}

export async function markShareTokenAsUsed(tokenId: string): Promise<ShareToken> {
    const db = await getDb();
    const [usedToken] = await db.update(shareTokens)
      .set({ isUsed: true })
      .where(eq(shareTokens.id, tokenId))
      .returning();
    return usedToken;
}
