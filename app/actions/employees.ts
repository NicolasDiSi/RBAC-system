"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/services/supabase/server"
import { checkPermission } from "@/lib/services/auth/permissions"
import { getAuthenticatedUser } from "@/lib/services/auth/user"

import { z } from "zod";
import { createEmployeeSchema, editEmployeeSchema } from "@/lib/validations/employee-schema";
import { deactivateEmployeeSchema } from "@/lib/validations/deactivation-schema"

export async function createEmployee(data: any) {
  const hasPermission = await checkPermission("employees.create")
  if (!hasPermission) {
    return { success: false, message: "Unauthorized", errors: null };
  }

  const user = await getAuthenticatedUser()
  const supabase = await getSupabaseServerClient()

  let validatedData;
  try {
    validatedData = createEmployeeSchema.parse(data);
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
    return { success: false, message: "An unknown validation error occurred.", errors: null };
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
    return { success: false, message: error.message, errors: null };
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
  return { success: true, message: "Employee created successfully!", errors: null };
}

export async function updateEmployee(id: string, data: any) {
  const hasPermission = await checkPermission("employees.update")
  if (!hasPermission) {
    return { success: false, message: "Unauthorized", errors: null };
  }

  const supabase = await getSupabaseServerClient()

  let validatedData;
  try {
    validatedData = editEmployeeSchema.parse(data);
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
    return { success: false, message: "An unknown validation error occurred.", errors: null };
  }

  const { error } = await supabase
    .from("empleados")
    .update(validatedData)
    .eq("id", id)

  if (error) {
    return { success: false, message: error.message, errors: null };
  }

  revalidatePath("/employees")
  revalidatePath(`/employees/${id}`)
  return { success: true, message: "Employee updated successfully!", errors: null };
}

export async function deactivateEmployee(employeeId: string, data: any) {
  const hasPermission = await checkPermission("employees.deactivate");
  if (!hasPermission) {
    return { success: false, message: "Unauthorized", errors: null };
  }

  const user = await getAuthenticatedUser();
  const supabase = await getSupabaseServerClient();

  let validatedData;
  try {
    validatedData = deactivateEmployeeSchema.parse(data);
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
    return { success: false, message: "An unknown validation error occurred.", errors: null };
  }

  const { error } = await supabase
    .from("empleados")
    .update({
      estado: "inactivo",
      fecha_egreso: validatedData.fecha_egreso,
    })
    .eq("id", employeeId);

  if (error) {
    return { success: false, message: error.message, errors: null };
  }

  // Create history entry for employee deactivation
  await supabase.from("historial_relacion_laboral").insert({
    empleado_id: employeeId,
    fecha_evento: validatedData.fecha_egreso,
    tipo_evento: "egreso",
    descripcion: `Employee deactivated by ${user?.email}`,
    created_by: user?.id,
  });

  revalidatePath("/employees");
  revalidatePath(`/employees/${employeeId}`);
  return { success: true, message: "Employee deactivated successfully!", errors: null };
}

