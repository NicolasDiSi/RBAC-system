import { enforceAuthentication } from "@/lib/services/auth/protection";
import { checkPermission } from "@/lib/services/auth/permissions";
import { EmployeeForm } from "@/components/employees/employee-form";
import { redirect, notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/services/supabase/server";

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  await enforceAuthentication();
  const canUpdate = await checkPermission("employees.update");

  if (!canUpdate) {
    redirect("/unauthorized");
  }

  const supabase = await getSupabaseServerClient();
  const { data: employee } = await supabase
    .from("empleados")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!employee) {
    notFound();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Employee</h1>
        <p className="text-muted-foreground">Update employee information</p>
      </div>
      <EmployeeForm employee={employee} />
    </div>
  );
}
