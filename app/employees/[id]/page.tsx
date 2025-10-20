import { redirect, notFound } from "next/navigation"
import { getCurrentUser, checkPermission } from "@/lib/auth/permissions"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { EmployeeDetail } from "@/components/employees/employee-detail"

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user || !user.is_active) {
    redirect("/auth/login")
  }

  const hasAccess = await checkPermission("employees.read")
  if (!hasAccess) {
    redirect("/employees")
  }

  const supabase = await getSupabaseServerClient()

  // Fetch employee with related data
  const { data: employee } = await supabase.from("empleados").select("*").eq("id", params.id).single()

  if (!employee) {
    notFound()
  }

  // Fetch assignments
  const { data: assignments } = await supabase
    .from("asignaciones_contratos")
    .select(`
      *,
      obra:obras(*)
    `)
    .eq("empleado_id", params.id)
    .order("fecha_inicio", { ascending: false })

  // Fetch documents
  const { data: documents } = await supabase
    .from("documentos")
    .select("*")
    .eq("empleado_id", params.id)
    .order("fecha_subida", { ascending: false })

  // Fetch history
  const { data: history } = await supabase
    .from("historial_relacion_laboral")
    .select(`
      *,
      obra:obras(nombre)
    `)
    .eq("empleado_id", params.id)
    .order("fecha_evento", { ascending: false })

  return (
    <AdminLayout>
      <EmployeeDetail
        employee={employee}
        assignments={assignments || []}
        documents={documents || []}
        history={history || []}
      />
    </AdminLayout>
  )
}
