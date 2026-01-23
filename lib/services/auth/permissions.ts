import { cache } from 'react'
import { getAuthenticatedUser } from "./user"
import { getRolePermissions } from '@/lib/data/role';
import { getDb } from '@/lib/db';
import schema from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';

const { permissions: permissionsTable } = schema;


export const getUserPermissions = cache(async (roleId: string | null) => {
  // If the user has no role, they have no permissions.
  if (!roleId) {
    return []
  }

  const permissionIds = await getRolePermissions(roleId);

  if (permissionIds.length === 0) {
    return [];
  }

  const db = await getDb();
  const permissions = await db.select().from(permissionsTable).where(inArray(permissionsTable.id, permissionIds));

  return permissions;
})

export async function hasPermission(roleId: string | null, permissionName: string): Promise<boolean> {
  const permissions = await getUserPermissions(roleId)
  return permissions.some((p: any) => p.name === permissionName)
}

/**
 * Checks permissions for a user object that has already been fetched.
 * This is optimized for use in middleware.
 */
export async function checkPermissionForUser(
  user: { id: string; isActive: boolean; roleId: string | null } | null,
  permissionName: string
): Promise<boolean> {
  if (!user || !user.isActive) {
    return false
  }
  return await hasPermission(user.roleId, permissionName)
}

/**
 * Checks permissions for the currently authenticated user.
 * This is for use in Server Components and Server Actions.
 */
export async function checkPermission(permissionName: string): Promise<boolean> {
  const user = await getAuthenticatedUser()
  // The user object from getAuthenticatedUser has roleId, not role_id
  const roleId = user?.role?.id ?? null;
  if (!user) return false;

  // We need to pass the user object in a way that matches checkPermissionForUser
  const userForCheck = {
    id: user.id,
    isActive: user.isActive ?? false,
    roleId: roleId
  };

  return checkPermissionForUser(userForCheck, permissionName)
}