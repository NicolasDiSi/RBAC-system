import { redirect } from "next/navigation"
import { getCurrentUser, checkPermission } from "@/lib/services/auth/permissions"
import { AdminLayout } from "@/components/admin/admin-layout"
import { EmployeeForm } from "@/components/employees/employee-form"

export default async function NewEmployeePage() {
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
  )
}
