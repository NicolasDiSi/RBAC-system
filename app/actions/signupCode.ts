'use server'

import { getDb } from '@/lib/db'
import { signupCodes } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

// Helper to generate a 6-digit alphanumeric code
async function generateUniqueSixDigitCode(): Promise<string> {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  let isUnique = false
  const db = await getDb()

  while (!isUnique) {
    result = ''
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    const existingCode = await db.query.signupCodes.findFirst({
        where: eq(signupCodes.code, result),
        columns: { id: true }
    })

    if (!existingCode) {
      isUnique = true
    }
  }
  return result
}

export async function createSignupCode(
  roleId: string,
  expirationInMinutes: number
): Promise<{ code: string; expiresAt: Date }> {
  const db = await getDb()

  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + expirationInMinutes)

  const uniqueCode = await generateUniqueSixDigitCode();

  const [data] = await db.insert(signupCodes).values({
      roleId: roleId,
      code: uniqueCode,
      expiresAt: expiresAt,
    }).returning();

  return { code: data.code, expiresAt: data.expiresAt }
}

export async function deleteSignupCode(codeId: string): Promise<void> {
  const db = await getDb()

  await db.delete(signupCodes).where(eq(signupCodes.id, codeId))
}
