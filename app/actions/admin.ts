"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { checkPermission } from "@/lib/auth/permissions"

export async function updateUserStatus(userId: string, isActive: boolean) {
  const hasPermission = await checkPermission("users.activate")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const supabase = await getSupabaseServerClient()
  await supabase.from("users").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", userId)

  revalidatePath("/admin/users")
}

export async function updateUserRole(userId: string, roleId: string) {
  const hasPermission = await checkPermission("users.assign_role")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const supabase = await getSupabaseServerClient()
  const updateData = roleId === "none" ? { role_id: null } : { role_id: roleId }

  await supabase
    .from("users")
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq("id", userId)

  revalidatePath("/admin/users")
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  const hasPermission = await checkPermission("roles.assign_permissions")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const supabase = await getSupabaseServerClient()

  // Delete existing permissions for this role
  await supabase.from("role_permissions").delete().eq("role_id", roleId)

  // Insert new permissions
  if (permissionIds.length > 0) {
    const rolePermissions = permissionIds.map((permissionId) => ({
      role_id: roleId,
      permission_id: permissionId,
    }))

    await supabase.from("role_permissions").insert(rolePermissions)
  }

  revalidatePath("/admin/roles")
}
