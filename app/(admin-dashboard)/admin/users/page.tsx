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

  // Fetch all roles for the dropdown
  const { data: roles } = await supabase.from("roles").select("*").order("name");

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts, activation status, and role assignments</p>
          </div>
        </div>
        <UsersTable users={users || []} roles={roles || []} />
      </div>
  );
}
