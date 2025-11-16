"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/services/supabase/server"
import { checkPermission } from "@/lib/services/auth/permissions"
import { getAuthenticatedUser } from "@/lib/services/auth/user"

export async function createEmployee(data: any) {
  const hasPermission = await checkPermission("employees.create")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const user = await getAuthenticatedUser()
  const supabase = await getSupabaseServerClient()

  const { data: employee, error } = await supabase
    .from("empleados")
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

  // Create history entry for employee creation
  await supabase.from("historial_relacion_laboral").insert({
    empleado_id: employee.id,
    fecha_evento: data.fecha_ingreso,
    tipo_evento: "ingreso",
    descripcion: `Employee joined the company as ${data.categoria || "employee"}`,
    categoria_nueva: data.categoria,
    created_by: user?.id,
  })

  revalidatePath("/employees")
  return employee
}
