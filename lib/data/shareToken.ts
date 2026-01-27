
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { shareTokens } from '../db/schema';

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
  
  // This is a simplified token generation. Use a more secure method in production.
  const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
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
