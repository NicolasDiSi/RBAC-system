"use server"

import { revalidatePath } from "next/cache"
import { deleteUserSessions } from "@/lib/services/auth/session"
import { checkPermission } from "@/lib/services/auth/permissions"
import { createUserSchema, editUserSchema } from "@/lib/validations/user-schema"
import { createRoleSchema, editRoleSchema } from "@/lib/validations/role-schema" // New import
import { adminUpdatePasswordSchema } from "@/lib/validations/password-schemas"
import * as UserDAO from "@/lib/data/user"
import * as RoleDAO from "@/lib/data/role"

import { createVerificationToken } from "./verificationToken"
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/services/email"

export async function createUser(data: FormData) {
  const hasPermission = await checkPermission("users.create")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const validatedFields = createUserSchema.safeParse(Object.fromEntries(data));

  if (!validatedFields.success) {
    throw new Error("Invalid user data.")
  }
  
  await UserDAO.createUser(validatedFields.data)

  revalidatePath("/admin/users")
}

export async function updateUser(userId: string, data: FormData) {
  const hasPermission = await checkPermission("users.update")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const validatedFields = editUserSchema.safeParse(Object.fromEntries(data));

  if (!validatedFields.success) {
    throw new Error("Invalid user data.")
  }

  await UserDAO.updateUser(userId, validatedFields.data)

  revalidatePath("/admin/users")
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  const hasPermission = await checkPermission("users.activate")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  await UserDAO.updateUserStatus(userId, isActive)

  revalidatePath("/admin/users")
}

export async function deleteUser(userId: string) {
  const hasPermission = await checkPermission("users.delete")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  await UserDAO.deleteUser(userId)

  revalidatePath("/admin/users")
}

export async function updateUserRole(userId: string, roleId: string) {
  const hasPermission = await checkPermission("users.assign_role")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const roleIdOrNull = roleId === "none" ? null : roleId
  await UserDAO.updateUserRole(userId, roleIdOrNull)

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

export async function createRole(data: FormData) {
  const hasPermission = await checkPermission("roles.create")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const validatedFields = createRoleSchema.safeParse(Object.fromEntries(data));

  if (!validatedFields.success) {
    throw new Error("Invalid role data.")
  }

  await RoleDAO.createRole(validatedFields.data)

  revalidatePath("/admin/roles")
}

export async function updateRole(roleId: string, data: FormData) {
  const hasPermission = await checkPermission("roles.update")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const validatedFields = editRoleSchema.safeParse(Object.fromEntries(data));

  if (!validatedFields.success) {
    throw new Error("Invalid role data.")
  }

  await RoleDAO.updateRole(roleId, validatedFields.data)

  revalidatePath("/admin/roles")
}

export async function deleteRole(roleId: string) {
  const hasPermission = await checkPermission("roles.delete")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  await RoleDAO.deleteRole(roleId)

  revalidatePath("/admin/roles")
}

export async function updateUserPassword(userId: string, data: FormData) {
  const hasPermission = await checkPermission("users.update_password")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const validatedFields = adminUpdatePasswordSchema.safeParse(Object.fromEntries(data));

  if (!validatedFields.success) {
    throw new Error(validatedFields.error.errors.map(e => e.message).join(', '));
  }

  const { password: newPassword, signOutUser } = validatedFields.data;

  await UserDAO.updateUserPassword(userId, newPassword)
  
  if (signOutUser) {
    await deleteUserSessions(userId)
  }

  revalidatePath("/admin/users")
}

export async function resetPasswordForEmail(email: string) {
  const hasPermission = await checkPermission("users.update_password")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const user = await UserDAO.getUserByEmail(email)
  if (!user) {
    throw new Error("User not found.")
  }

  const { token } = await createVerificationToken(user.id, 'password_reset')
  await sendPasswordResetEmail(user.email, token)
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