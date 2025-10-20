import { redirect } from "next/navigation"
import { getCurrentUser, checkPermission } from "@/lib/auth/permissions"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { EmployeesTable } from "@/components/employees/employees-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function EmployeesPage() {
  const user = await getCurrentUser()

  if (!user || !user.is_active) {
    redirect("/auth/login")
  }

  const hasAccess = await checkPermission("employees.read")
  if (!hasAccess) {
    redirect("/dashboard")
  }

  const supabase = await getSupabaseServerClient()

  // Fetch all employees
  const { data: employees } = await supabase.from("empleados").select("*").order("created_at", { ascending: false })

  const canCreate = await checkPermission("employees.create")

  return (
    <AdminLayout>
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
        <EmployeesTable employees={employees || []} />
      </div>
    </AdminLayout>
  )
}
