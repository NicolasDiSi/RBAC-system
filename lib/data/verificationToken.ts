
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import schema from '../db/schema';

const { verificationTokens } = schema;

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;

export async function getVerificationTokenByToken(token: string): Promise<VerificationToken | undefined> {
  const db = await getDb();
  return db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.token, token),
  });
}

export async function markVerificationTokenAsUsed(tokenId: string): Promise<VerificationToken> {
  const db = await getDb();
  const [usedToken] = await db.update(verificationTokens)
    .set({ isUsed: true, updatedAt: new Date() })
    .where(eq(verificationTokens.id, tokenId))
    .returning();
  return usedToken;
}

export async function createToken(data: NewVerificationToken): Promise<VerificationToken> {
    const db = await getDb();
    const [token] = await db.insert(verificationTokens).values(data).returning();
    return token;
}
