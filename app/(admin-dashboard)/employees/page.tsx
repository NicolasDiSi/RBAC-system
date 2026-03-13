import { enforceAuthentication } from "@/lib/services/auth/protection";
import { checkPermission } from "@/lib/services/auth/permissions";
import { getEmployees } from "@/app/actions/employees";
import { EmployeesTable } from "@/components/employees/employees-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function EmployeesPage() {
  await enforceAuthentication();
  const canView = await checkPermission("employees.read");

  if (!canView) {
    redirect("/unauthorized");
  }

  // Fetch all employees
  const employeesList = await getEmployees('recent');

  const canCreate = await checkPermission("employees.create");

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Employee Management</h1>
            <p className="text-muted-foreground">Manage employee records and information</p>
          </div>
          {canCreate && (
            <Link href="/employees/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            </Link>
          )}
        </div>
        <EmployeesTable employees={employeesList} />
      </div>
  );
}
