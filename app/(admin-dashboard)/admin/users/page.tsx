import { enforceAuthentication } from "@/lib/services/auth/protection";
import { checkPermission } from "@/lib/services/auth/permissions";
import { UserDAO } from "@/lib/data/user";
import { RoleDAO } from "@/lib/data/role";
import { UsersTable } from "@/components/admin/users-table";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  await enforceAuthentication();
  const canView = await checkPermission("users.read");

  if (!canView) {
    redirect("/unauthorized");
  }

  // Fetch all users and roles using the respective DAOs
  const users = await UserDAO.getAll();
  const roles = await RoleDAO.getAll();

  const permissions = {
    canCreate: await checkPermission("users.create"),
    canUpdate: await checkPermission("users.update"),
    canDelete: await checkPermission("users.delete"),
    canUpdatePassword: await checkPermission("users.update_password"),
    canResendVerification: await checkPermission("users.send_verification_email"), // Assuming this permission exists
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
