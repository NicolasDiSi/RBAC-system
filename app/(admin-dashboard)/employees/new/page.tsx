import { enforceAuthentication } from "@/lib/services/auth/protection";
import { checkPermission } from "@/lib/services/auth/permissions";
import { AdminLayout } from "@/components/admin/admin-layout";
import { EmployeeForm } from "@/components/employees/employee-form";
import { redirect } from "next/navigation";

export default async function NewEmployeePage() {
  await enforceAuthentication();
  const canCreate = await checkPermission("employees.create");

  if (!canCreate) {
    redirect("/unauthorized");
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add New Employee</h1>
          <p className="text-muted-foreground">Enter employee information to create a new record</p>
        </div>
        <EmployeeForm />
      </div>
    </AdminLayout>
  );
}
