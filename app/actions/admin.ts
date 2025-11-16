"use server"

import { revalidatePath } from "next/cache"
import { deleteUserSessions } from "@/lib/services/auth/session"
import { checkPermission } from "@/lib/services/auth/permissions"
import { createUserSchema, editUserSchema } from "@/lib/validations/user-schema"
import { UserDAO } from "@/lib/data/user"
import { RoleDAO } from "@/lib/data/role"

export async function createUser(formData: FormData) {
  const hasPermission = await checkPermission("users.create")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const formObject = Object.fromEntries(formData.entries());
  const validatedFields = createUserSchema.safeParse({
    ...formObject,
    is_active: formObject.is_active === 'true'
  });

  if (!validatedFields.success) {
    throw new Error("Invalid user data.")
  }
  
  await UserDAO.create(validatedFields.data)

  revalidatePath("/admin/users")
}

export async function updateUser(userId: string, formData: FormData) {
  const hasPermission = await checkPermission("users.update")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const formObject = Object.fromEntries(formData.entries());
  const validatedFields = editUserSchema.safeParse({
    ...formObject,
    is_active: formObject.is_active === 'true'
  });

  if (!validatedFields.success) {
    throw new Error("Invalid user data.")
  }

  await UserDAO.update(userId, validatedFields.data)

  revalidatePath("/admin/users")
}


export async function updateUserStatus(userId: string, isActive: boolean) {
  const hasPermission = await checkPermission("users.activate")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  await UserDAO.updateStatus(userId, isActive)

  revalidatePath("/admin/users")
}

export async function updateUserRole(userId: string, roleId: string) {
  const hasPermission = await checkPermission("users.assign_role")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const roleIdOrNull = roleId === "none" ? null : roleId
  await UserDAO.updateRole(userId, roleIdOrNull)

  revalidatePath("/admin/users")
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  const hasPermission = await checkPermission("roles.assign_permissions")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  await RoleDAO.updatePermissions(roleId, permissionIds)

  revalidatePath("/admin/roles")
}

export async function getRoles() {
  const hasPermission = await checkPermission("roles.read")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  return RoleDAO.getAll()
}

export async function updateUserPassword(userId: string, formData: FormData) {
  const hasPermission = await checkPermission("users.update_password")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const newPassword = formData.get('password') as string
  const signOutUser = formData.get('sign_out_user') === 'true'

  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters.")
  }

  await UserDAO.updatePassword(userId, newPassword)
  
  if (signOutUser) {
    await deleteUserSessions(userId)
  }

  revalidatePath("/admin/users")
}

// This action doesn't use our DAO because it uses Supabase's auth helpers,
// which is a separate part of their API. This is fine.
export async function resetPasswordForEmail(email: string) {
  const hasPermission = await checkPermission("users.update_password")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const supabase = await getSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`,
  })

  if (error) {
    throw new Error(error.message)
  }
}