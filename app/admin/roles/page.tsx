import { redirect } from "next/navigation"
import { getCurrentUser, checkPermission } from "@/lib/auth/permissions"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { RolesTable } from "@/components/admin/roles-table"

export default async function AdminRolesPage() {
  const supabase = await getSupabaseServerClient()

  // Fetch all roles with permission counts
  const { data: roles } = await supabase
    .from("roles")
    .select(`
      *,
      role_permissions(count)
    `)
    .order("name")

  // Fetch all permissions grouped by resource
  const { data: permissions } = await supabase.from("permissions").select("*").order("resource, action")

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Manage roles and their associated permissions</p>
        </div>
        <RolesTable roles={roles || []} permissions={permissions || []} />
      </div>
    </AdminLayout>
  )
}
