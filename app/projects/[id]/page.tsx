import { redirect, notFound } from "next/navigation"
import { getCurrentUser, checkPermission } from "@/lib/auth/permissions"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ProjectDetail } from "@/components/projects/project-detail"

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()

  // Fetch project
  const { data: project } = await supabase.from("obras").select("*").eq("id", params.id).single()

  if (!project) {
    notFound()
  }

  // Fetch assignments with employee details
  const { data: assignments } = await supabase
    .from("asignaciones_contratos")
    .select(`
      *,
      empleado:empleados(*)
    `)
    .eq("obra_id", params.id)
    .order("fecha_inicio", { ascending: false })

  // Fetch all employees for assignment form
  const { data: employees } = await supabase.from("empleados").select("*").eq("estado", "activo").order("apellido")

  return (
    <AdminLayout>
      <ProjectDetail project={project} assignments={assignments || []} employees={employees || []} />
    </AdminLayout>
  )
}
