import { enforceAuthentication } from "@/lib/services/auth/protection";
import { checkPermission } from "@/lib/services/auth/permissions";
import { getAllRolesWithPermissionCount, getAllPermissions  } from "@/lib/data/role";
import { RolesTable } from "@/components/admin/roles-table";
import { redirect } from "next/navigation";

export default async function AdminRolesPage() {
  await enforceAuthentication();
  const canView = await checkPermission("roles.read");

  if (!canView) {
    redirect("/unauthorized");
  }

  // Fetch all roles and permissions using the DAO
  const roles = await getAllRolesWithPermissionCount();
  const permissions = await getAllPermissions();

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Manage roles and their associated permissions</p>
        </div>
        <RolesTable roles={roles || []} permissions={permissions || []} />
      </div>
  );
}
