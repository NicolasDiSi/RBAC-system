import { cache } from 'react'
import { getSupabaseServiceRoleClient } from '../supabase/server'
import { getAuthenticatedUser } from "./user"

export const getUserPermissions = cache(async (roleId: string | null) => {
  const supabase = await getSupabaseServiceRoleClient()

  // If the user has no role, they have no permissions.
  if (!roleId) {
    return []
  }

  const { data: permissions } = await supabase
    .from("role_permissions")
    .select(`
      permission:permissions(*)
    `)
    .eq("role_id", roleId)

  return permissions?.map((rp: any) => rp.permission) || []
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
  user: { id: string; is_active: boolean; role_id: string | null } | null,
  permissionName: string
): Promise<boolean> {
  if (!user || !user.is_active) {
    return false
  }
  return await hasPermission(user.role_id, permissionName)
}

/**
 * Checks permissions for the currently authenticated user.
 * This is for use in Server Components and Server Actions.
 */
export async function checkPermission(permissionName: string): Promise<boolean> {
  const user = await getAuthenticatedUser()
  return checkPermissionForUser(user, permissionName)
}
