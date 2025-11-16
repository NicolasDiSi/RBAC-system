"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/services/supabase/server"
import { deleteUserSessions } from "@/lib/services/auth/session"
import { checkPermission } from "@/lib/services/auth/permissions"
import { createUserSchema, editUserSchema } from "@/lib/validations/user-schema"
import { hash } from "bcrypt"

export async function createUser(formData: FormData) {
  const hasPermission = await checkPermission("users.create")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  // Convert FormData to a plain object for Zod validation
  const formObject = Object.fromEntries(formData.entries());
  const validatedFields = createUserSchema.safeParse({
    ...formObject,
    is_active: formObject.is_active === 'true' // Ensure boolean conversion
  });

  if (!validatedFields.success) {
    // TODO: Return a more structured error
    throw new Error("Invalid user data.")
  }
  
  const { password, ...userData } = validatedFields.data

  const supabase = await getSupabaseServerClient()
  const hashedPassword = await hash(password, 12)
  await supabase.from("users").insert([{ ...userData, hashed_password: hashedPassword }])


  revalidatePath("/admin/users")
}

export async function updateUser(userId: string, formData: FormData) {
  const hasPermission = await checkPermission("users.update")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  // Convert FormData to a plain object for Zod validation
  const formObject = Object.fromEntries(formData.entries());
  const validatedFields = editUserSchema.safeParse({
    ...formObject,
    is_active: formObject.is_active === 'true' // Ensure boolean conversion
  });

  if (!validatedFields.success) {
    // TODO: Return a more structured error
    throw new Error("Invalid user data.")
  }

  const { password, ...userData } = validatedFields.data

  const supabase = await getSupabaseServerClient()

  if (password) {
    const hashedPassword = await hash(password, 12)
    await supabase.from("users").update({ ...userData, hashed_password: hashedPassword }).eq("id", userId)
  } else {
    await supabase.from("users").update(userData).eq("id", userId)
  }

  revalidatePath("/admin/users")
}


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

export async function getRoles() {
  const hasPermission = await checkPermission("roles.read")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const supabase = await getSupabaseServerClient()
  const { data, error } = await supabase.from("roles").select("id, name")

  if (error) {
    throw new Error(error.message)
  }

  return data
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

  const hashedPassword = await hash(newPassword, 12)

  const supabase = await getSupabaseServerClient()
  await supabase
    .from("users")
    .update({ hashed_password: hashedPassword, updated_at: new Date().toISOString() })
    .eq("id", userId)
  
  if (signOutUser) {
    await deleteUserSessions(userId)
  }

  revalidatePath("/admin/users")
}

// Refactor resetPasswordEmail Service
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