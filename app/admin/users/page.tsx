import { redirect } from "next/navigation"
import { getCurrentUser, checkPermission } from "@/lib/auth/permissions"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { UsersTable } from "@/components/admin/users-table"

export default async function AdminUsersPage() {
  const user = await getCurrentUser()

  if (!user || !user.is_active) {
    redirect("/login")
  }

  const hasAccess = await checkPermission("users.read")
  if (!hasAccess) {
    redirect("/dashboard")
  }

  const supabase = await getSupabaseServerClient()

  // Fetch all users with their roles
  const { data: users } = await supabase
    .from("users")
    .select(`
      *,
      role:roles(*)
    `)
    .order("created_at", { ascending: false })

  // Fetch all roles for the dropdown
  const { data: roles } = await supabase.from("roles").select("*").order("name")

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts, activation status, and role assignments</p>
        </div>
        <UsersTable users={users || []} roles={roles || []} />
      </div>
    </AdminLayout>
  )
}
