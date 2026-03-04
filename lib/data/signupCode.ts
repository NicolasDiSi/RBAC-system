
import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { signupCodes } from '../db/schema';
import { InferTableQuery, TableProps,} from '../db/types';


//SignupCode Infers the Table from the Drizzle ORM if no relationships or columns are provided uses InferTableQuery to handle types accordingly
export type SignupCode<T extends TableProps<'signupCodes'>['with'] | undefined = undefined> = InferTableQuery<'signupCodes',undefined,T>;
export type NewSignupCode = typeof signupCodes.$inferInsert;

export async function getSignupCodeByCode(code: string): Promise<SignupCode | undefined> {
  const db = await getDb();
  return db.query.signupCodes.findFirst({
    where: eq(signupCodes.code, code),
  });
}

export async function getSignupCodeByUsedId(userId: string): Promise<SignupCode | undefined> {
  const db = await getDb();
  return db.query.signupCodes.findFirst({
    where: eq(signupCodes.usedByUserId, userId),
  });
}

export async function getAllSignupCodes(): Promise<SignupCode<{ role: true, usedByUser: { columns: { name: true, email: true } } }>[]> {
  const db = await getDb();
  return db.query.signupCodes.findMany({
    orderBy: (signupCodes, { desc }) => [desc(signupCodes.expiresAt)],
    with: {
        role: true,
        usedByUser: {
            columns: {
                name: true,
                email: true,
            }
        }
    }
  });
}

export async function deleteSignupCode(id: string): Promise<SignupCode> {
    const db = await getDb();
    const [deletedCode] = await db.delete(signupCodes).where(eq(signupCodes.id, id)).returning();
    return deletedCode;
}

export async function createSignupCode(
    roleId: string | null,
    expirationDurationMinutes: number
): Promise<SignupCode> {
  const db = await getDb();
  
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const expiresAt = new Date(Date.now() + expirationDurationMinutes * 60 * 1000);

  const newCodeData: NewSignupCode = {
    code,
    expiresAt,
    roleId: roleId,
  };

  const [createdCode] = await db.insert(signupCodes).values(newCodeData).returning();
  return createdCode;
}

export async function markSignupCodeAsUsed(codeId: string, userId: string): Promise<SignupCode> {
  const db = await getDb();
  const [usedCode] = await db.update(signupCodes)
    .set({ isUsed: true, usedAt: new Date(), usedByUserId: userId })
    .where(eq(signupCodes.id, codeId))
    .returning();
  return usedCode;
}
