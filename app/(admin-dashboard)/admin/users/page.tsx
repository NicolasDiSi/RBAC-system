import { enforceAuthentication } from "@/lib/services/auth/protection";
import { checkPermission } from "@/lib/services/auth/permissions";
import { getSupabaseServerClient } from "@/lib/services/supabase/server";
import { UsersTable } from "@/components/admin/users-table";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  await enforceAuthentication();
  const canView = await checkPermission("users.read");

  if (!canView) {
    redirect("/unauthorized");
  }

  const supabase = await getSupabaseServerClient();

  // Fetch all users with their roles
  const { data: users } = await supabase
    .from("users")
    .select(
      `
      *,
      role:roles(*)
    `
    )
    .order("created_at", { ascending: false });

  const { data: roles } = await supabase.from("roles").select("id, name")

  const permissions = {
    canUpdate: await checkPermission("users.update"),
    canDelete: await checkPermission("users.delete"),
    canUpdatePassword: await checkPermission("users.update_password"),
    canShare: await checkPermission("users.share_credentials"), // Assuming this permission exists
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts, roles, and permissions.
        </p>
      </div>
      <UsersTable users={users || []} roles={roles || []} permissions={permissions} />
    </div>
  )
}
