"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/lib/services/auth/user"
import { getSupabaseServerClient } from "@/lib/services/supabase/server"
import { checkPermission } from "@/lib/services/auth/permissions"

export async function createProject(data: any) {
  const user = await getAuthenticatedUser()
  const hasPermission = await checkPermission("projects.create")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const supabase = await getSupabaseServerClient()

  const { data: project, error } = await supabase
    .from("obras")
    .insert({
      ...data,
      created_by: user?.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/projects")
  return project
}

export async function createAssignment(data: any) {
  const user = await getAuthenticatedUser()
  const hasPermission = await checkPermission("assignments.create")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const supabase = await getSupabaseServerClient()

  // Get employee details for history
  const { data: employee } = await supabase.from("empleados").select("*").eq("id", data.empleado_id).single()

  const { data: assignment, error } = await supabase
    .from("asignaciones_contratos")
    .insert({
      ...data,
      estado: "activo",
      created_by: user?.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Create history entry for assignment
  await supabase.from("historial_relacion_laboral").insert({
    empleado_id: data.empleado_id,
    fecha_evento: data.fecha_inicio,
    tipo_evento: "cambio_obra",
    descripcion: `Assigned to project with category ${data.categoria}`,
    obra_id: data.obra_id,
    categoria_nueva: data.categoria,
    created_by: user?.id,
  })

  revalidatePath(`/projects/${data.obra_id}`)
  revalidatePath(`/employees/${data.empleado_id}`)
  return assignment
}
