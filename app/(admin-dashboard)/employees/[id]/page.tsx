import { redirect, notFound } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/services/supabase/server"
import { EmployeeDetail } from "@/components/employees/employee-detail"
import { checkPermission } from "@/lib/services/auth/permissions"

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const employeeId = String(id);
  const supabase = await getSupabaseServerClient()

  const permissions = {
    canUpdate: await checkPermission("employees.update"),
    canDeactivate: await checkPermission("employees.deactivate"),
  }

  // Fetch employee with related data
  const { data: employee } = await supabase.from("empleados").select("*").eq("id", employeeId).single()

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
    .eq("empleado_id", employeeId)
    .order("fecha_inicio", { ascending: false })

  // Fetch documents
  const { data: documents } = await supabase
    .from("documentos")
    .select("*")
    .eq("empleado_id", employeeId)
    .order("fecha_subida", { ascending: false })

  // Fetch history
  const { data: history } = await supabase
    .from("historial_relacion_laboral")
    .select(`
      *,
      obra:obras(nombre)
    `)
    .eq("empleado_id", employeeId)
    .order("fecha_evento", { ascending: false })

  return (
      <EmployeeDetail
        employee={employee}
        assignments={assignments || []}
        documents={documents || []}
        history={history || []}
        permissions={permissions}
      />
  )
}
