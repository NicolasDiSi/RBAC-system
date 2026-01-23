import { sql, eq, inArray } from 'drizzle-orm';
import { getDb } from '../db';
import schema from '../db/schema';

const { roles, permissions, rolePermissions } = schema;

export type Role = typeof roles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export async function getAllRoles(): Promise<Role[]> {
  const db = await getDb();
  return db.select().from(roles).orderBy(roles.name);
}

export async function getAllRolesWithPermissionCount(): Promise<any[]> {
    const db = await getDb();
    const result = await db
      .select({
        id: roles.id,
        name: roles.name,
        description: roles.description,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
        permissionCount: sql<number>`count(${rolePermissions.permissionId})`.mapWith(Number),
      })
      .from(roles)
      .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
      .groupBy(roles.id)
      .orderBy(roles.name);
    return result;
}

export async function getAllPermissions(): Promise<Permission[]> {
  const db = await getDb();
  return db.select().from(permissions).orderBy(permissions.resource, permissions.action);
}

export async function getRoleById(roleId: string): Promise<Role | undefined> {
  const db = await getDb();
  return db.query.roles.findFirst({
    where: eq(roles.id, roleId),
  });
}

export async function createRole(roleData: NewRole): Promise<Role> {
  const db = await getDb();
  const [newRole] = await db.insert(roles).values(roleData).returning();
  return newRole;
}

export async function updateRole(roleId: string, roleData: Partial<NewRole>): Promise<Role> {
  const db = await getDb();
  const [updatedRole] = await db
    .update(roles)
    .set({ ...roleData, updatedAt: new Date() })
    .where(eq(roles.id, roleId))
    .returning();
  return updatedRole;
}

export async function deleteRole(roleId: string): Promise<Role> {
    const db = await getDb();
    const [deletedRole] = await db.delete(roles).where(eq(roles.id, roleId)).returning();
    return deletedRole;
}

export async function getRolePermissions(roleId: string): Promise<string[]> {
    const db = await getDb();
    const results = await db
      .select({ permissionId: rolePermissions.permissionId })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));
    return results.map((rp) => rp.permissionId);
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    const db = await getDb();
    await db.transaction(async (tx) => {
        // Delete existing permissions
        await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

        // Insert new permissions
        if (permissionIds.length > 0) {
            const newPermissions = permissionIds.map((permissionId) => ({
                roleId: roleId,
                permissionId: permissionId,
            }));
            await tx.insert(rolePermissions).values(newPermissions);
        }
    });
}