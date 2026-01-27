
import { getDb } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hash } from 'bcrypt';

// The user type will be inferred from the schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return user || null;
}

export async function createUser(data: NewUser): Promise<User[]> {
    const db = await getDb();
    if (data.hashedPassword) {
        data.hashedPassword = await hash(data.hashedPassword, 12);
    }
    return db.insert(users).values(data).returning();
}

export async function getUserById(userId: string): Promise<User | null> {
    const db = await getDb();
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });
    return user || null;
}

export async function getUserWithRoleById(userId: string) {
    const db = await getDb();
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
            role: true,
        },
    });
    return user;
}

export async function updateUserVerificationStatus(userId: string): Promise<User> {
    const db = await getDb();
    const [updatedUser] = await db.update(users)
        .set({ verifiedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, userId))
        .returning();
    return updatedUser;
}

export async function getAllUsers() {
    const db = await getDb();
    const allUsers = await db.query.users.findMany({
        with: {
            role: true,
        },
    });
    return allUsers;
}
