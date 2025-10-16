import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function getCurrentUser() {
  const supabase = await getSupabaseServerClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    return null
  }

  // Get user with role information
  const { data: user } = await supabase
    .from("users")
    .select(`
      *,
      role:roles(*)
    `)
    .eq("google_id", authUser.id)
    .single()

  return user
}

export async function getUserPermissions(userId: string) {
  const supabase = await getSupabaseServerClient()

  const { data: user } = await supabase.from("users").select("role_id").eq("id", userId).single()

  if (!user?.role_id) {
    return []
  }

  const { data: permissions } = await supabase
    .from("role_permissions")
    .select(`
      permission:permissions(*)
    `)
    .eq("role_id", user.role_id)

  return permissions?.map((rp: any) => rp.permission) || []
}

export async function hasPermission(userId: string, permissionName: string): Promise<boolean> {
  const permissions = await getUserPermissions(userId)
  return permissions.some((p: any) => p.name === permissionName)
}

export async function checkPermission(permissionName: string): Promise<boolean> {
  const user = await getCurrentUser()

  if (!user || !user.is_active) {
    return false
  }

  return await hasPermission(user.id, permissionName)
}
