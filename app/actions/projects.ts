"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/lib/services/auth/user"
import { getSupabaseServerClient } from "@/lib/services/supabase/server"
import { checkPermission } from "@/lib/services/auth/permissions"
import { z } from "zod";
import { createProjectSchema } from "@/lib/validations/project-schema"
import { createAssignmentSchema } from "@/lib/validations/assignment-schema"
import { endAssignmentSchema } from "@/lib/validations/end-assignment-schema"

export async function createProject(data: any) {
  const user = await getAuthenticatedUser()
  const hasPermission = await checkPermission("projects.create")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

  const supabase = await getSupabaseServerClient()

  let validatedData;
  try {
    validatedData = createProjectSchema.parse(data);
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

  const { data: project, error } = await supabase
    .from("obras")
    .insert({
      ...validatedData,
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

  let validatedData;
  try {
    validatedData = createAssignmentSchema.parse(data);
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

  // Get employee details for history
  const { data: employee } = await supabase.from("empleados").select("*").eq("id", validatedData.empleado_id).single()

  const { data: assignment, error } = await supabase
    .from("asignaciones_contratos")
    .insert({
      ...validatedData,
      estado: validatedData.estado || "activo", // Use validatedData.estado if provided, otherwise default
      created_by: user?.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Create history entry for assignment
  await supabase.from("historial_relacion_laboral").insert({
    empleado_id: validatedData.empleado_id,
    fecha_evento: validatedData.fecha_inicio,
    tipo_evento: "cambio_obra",
    descripcion: `Assigned to project with category ${validatedData.categoria || "N/A"}`,
    obra_id: validatedData.obra_id,
    categoria_nueva: validatedData.categoria,
    created_by: user?.id,
  })

  revalidatePath(`/projects/${validatedData.obra_id}`)
  revalidatePath(`/employees/${validatedData.empleado_id}`)
  return assignment
}

export async function endAssignment(data: { assignment_id: string, fecha_fin: string }) {
  const user = await getAuthenticatedUser();
  const hasPermission = await checkPermission("assignments.update");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }

  const supabase = await getSupabaseServerClient();
  const validatedData = endAssignmentSchema.parse(data);

  const { data: existingAssignment, error: fetchError } = await supabase
    .from("asignaciones_contratos")
    .select("*")
    .eq("id", validatedData.assignment_id)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (existingAssignment.fecha_fin) {
    throw new Error("Cannot edit an assignment that has an end date.");
  }

  const { error: updateError } = await supabase
    .from("asignaciones_contratos")
    .update({ fecha_fin: validatedData.fecha_fin, estado: "finalizado" })
    .eq("id", validatedData.assignment_id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  await supabase.from("historial_relacion_laboral").insert({
    empleado_id: existingAssignment.empleado_id,
    fecha_evento: validatedData.fecha_fin,
    tipo_evento: "egreso",
    descripcion: `Assignment ended for project`,
    obra_id: existingAssignment.obra_id,
    created_by: user?.id,
  });

  revalidatePath(`/projects/${existingAssignment.obra_id}`);
  revalidatePath(`/employees/${existingAssignment.empleado_id}`);

  return {
    ...existingAssignment,
    fecha_fin: validatedData.fecha_fin,
    estado: "finalizado",
  };
}

export async function updateAssignment(assignmentId: string, data: any) {
  const hasPermission = await checkPermission("assignments.update");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }

  const supabase = await getSupabaseServerClient();

  const { data: existingAssignment, error: fetchError } = await supabase
    .from("asignaciones_contratos")
    .select("fecha_fin")
    .eq("id", assignmentId)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (existingAssignment?.fecha_fin) {
    throw new Error("Cannot edit an assignment that has an end date.");
  }

  const validatedData = createAssignmentSchema.parse(data);

  const { data: updatedAssignment, error } = await supabase
    .from("asignaciones_contratos")
    .update(validatedData)
    .eq("id", assignmentId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${updatedAssignment.obra_id}`);
  revalidatePath(`/employees/${updatedAssignment.empleado_id}`);

  return updatedAssignment;
}

export async function updateProject(projectId: string, data: any) {
  const hasPermission = await checkPermission("projects.update");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }

  const supabase = await getSupabaseServerClient();
  const validatedData = createProjectSchema.parse(data);

  const { data: updatedProject, error } = await supabase
    .from("obras")
    .update(validatedData)
    .eq("id", projectId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${updatedProject.id}`);

  return updatedProject;
}
