"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/services/supabase/server"
import { checkPermission } from "@/lib/services/auth/permissions"
import { getAuthenticatedUser } from "@/lib/services/auth/user"

import { z } from "zod";
import { employeeSchema } from "@/lib/validations/employee-schema";

export async function createEmployee(data: any) {
  const hasPermission = await checkPermission("employees.create")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const user = await getAuthenticatedUser()
  const supabase = await getSupabaseServerClient()

  let validatedData;
  try {
    validatedData = employeeSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors: { [key: string]: string[] } = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(err.message);
      });
      return { success: false, message: "Validation failed.", errors: fieldErrors };
    }
    return { success: false, message: "An unknown validation error occurred." };
  }

  const { data: employee, error } = await supabase
    .from("empleados")
    .insert({
      ...validatedData,
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
    fecha_evento: validatedData.fecha_ingreso,
    tipo_evento: "ingreso",
    descripcion: `Employee joined the company as ${validatedData.categoria || "employee"}`,
    categoria_nueva: validatedData.categoria,
    created_by: user?.id,
  })

  revalidatePath("/employees")
  return { success: true, message: "Employee created successfully!" };
}
