"use server"

import { revalidatePath } from "next/cache"
import { deleteUserSessions } from "@/lib/services/auth/session"
import { checkPermission } from "@/lib/services/auth/permissions"
import { createUserSchema, editUserSchema } from "@/lib/validations/user-schema"
import { createRoleSchema, editRoleSchema } from "@/lib/validations/role-schema" // New import
import { adminUpdatePasswordSchema } from "@/lib/validations/password-schemas"
import * as UserDAO from "@/lib/data/user"
import * as RoleDAO from "@/lib/data/role"
import { getSupabaseServerClient } from "@/lib/services/supabase/server"

import { createVerificationToken } from "./verificationToken"
import { sendVerificationEmail } from "@/lib/services/email"

export async function createUser(data: FormData) {
  const hasPermission = await checkPermission("users.create")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const validatedFields = createUserSchema.safeParse(data);

  if (!validatedFields.success) {
    throw new Error("Invalid user data.")
  }
  
  await UserDAO.create(validatedFields.data)

  revalidatePath("/admin/users")
}

export async function updateUser(userId: string, data: FormData) {
  const hasPermission = await checkPermission("users.update")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const validatedFields = editUserSchema.safeParse(data);

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

export async function deleteUser(userId: string) {
  const hasPermission = await checkPermission("users.delete")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  await UserDAO.delete(userId)

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

  await RoleDAO.updateRolePermissions(roleId, permissionIds)

  revalidatePath("/admin/roles")
}

export async function getRoles() {
  const hasPermission = await checkPermission("roles.read")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  return RoleDAO.getAllRoles()
}

export async function createRole(data: any) {
  const hasPermission = await checkPermission("roles.create")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const validatedFields = createRoleSchema.safeParse(data);

  if (!validatedFields.success) {
    throw new Error("Invalid role data.")
  }

  await RoleDAO.create(validatedFields.data)

  revalidatePath("/admin/roles")
}

export async function updateRole(roleId: string, data: FormData) {
  const hasPermission = await checkPermission("roles.update")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const validatedFields = editRoleSchema.safeParse(data);

  if (!validatedFields.success) {
    throw new Error("Invalid role data.")
  }

  await RoleDAO.update(roleId, validatedFields.data)

  revalidatePath("/admin/roles")
}

export async function deleteRole(roleId: string) {
  const hasPermission = await checkPermission("roles.delete")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  await RoleDAO.delete(roleId)

  revalidatePath("/admin/roles")
}

export async function updateUserPassword(userId: string, data: FormData) {
  const hasPermission = await checkPermission("users.update_password")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const validatedFields = adminUpdatePasswordSchema.safeParse({...data});

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors.map(e => e.message).join(', '));
  }

  const { password: newPassword, sign_out_user: signOutUser } = validatedFields.data;

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

export async function resendVerificationEmail(userId: string) {
  const hasPermission = await checkPermission("users.send_verification_email") // Assuming a new permission
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const user = await UserDAO.getUserById(userId)
  if (!user || !user.email) {
    throw new Error("User not found or email missing.")
  }

  try {
    const { token } = await createVerificationToken(userId, 'email_verification');
    await sendVerificationEmail(user.email, token);
  } catch (emailError) {
    console.error('Error resending verification email:', emailError);
    throw new Error('Failed to resend verification email.');
  }
}