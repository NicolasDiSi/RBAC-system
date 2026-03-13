"use server"

import { revalidatePath } from "next/cache"
import { getAuthenticatedUser } from "@/lib/services/auth/user"
import { checkPermission } from "@/lib/services/auth/permissions"
import { getDb } from "@/lib/db"
import { obras, asignacionesContratos, historialRelacionLaboral, empleados } from "@/lib/db/schema"
import { eq, desc, count } from "drizzle-orm"
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

  const db = await getDb();
  const [project] = await db.insert(obras).values({
      nombre: validatedData.nombre,
      codigo: validatedData.codigo,
      ubicacion: validatedData.ubicacion,
      fechaInicio: validatedData.fechaInicio,
      fechaFinEstimada: validatedData.fechaFinEstimada,
      presupuesto: validatedData.presupuesto?.toString(),
      descripcion: validatedData.descripcion,
      createdBy: user?.id,
    }).returning();

  revalidatePath("/projects")
  return project
}

export async function createAssignment(data: any) {
  const user = await getAuthenticatedUser()
  const hasPermission = await checkPermission("assignments.create")
  if (!hasPermission) {
    throw new Error("Unauthorized")
  }

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

  const db = await getDb();

  // Get employee details for history
  const employee = await db.query.empleados.findFirst({
    where: eq(empleados.id, validatedData.empleadoId)
  });

  const [assignment] = await db.insert(asignacionesContratos).values({
      empleadoId: validatedData.empleadoId,
      obraId: validatedData.obraId,
      fechaInicio: validatedData.fechaInicio,
      fechaFin: validatedData.fechaFin,
      tipoContrato: validatedData.tipoContrato,
      categoria: validatedData.categoria,
      salario: validatedData.salario?.toString(),
      observaciones: validatedData.observaciones,
      estado: validatedData.estado || "activo", // Use validatedData.estado if provided, otherwise default
      createdBy: user?.id,
    }).returning();

  // Create history entry for assignment
  await db.insert(historialRelacionLaboral).values({
    empleadoId: validatedData.empleadoId,
    fechaEvento: validatedData.fechaInicio,
    tipoEvento: "cambio_obra",
    descripcion: `Assigned to project with category ${validatedData.categoria || "N/A"}`,
    obraId: validatedData.obraId,
    categoriaNueva: validatedData.categoria,
    createdBy: user?.id,
  });

  revalidatePath(`/projects/${validatedData.obraId}`)
  revalidatePath(`/employees/${validatedData.empleadoId}`)
  return assignment
}

export async function endAssignment(data: { assignmentId: string, fechaFin: string }) {
  const user = await getAuthenticatedUser();
  const hasPermission = await checkPermission("assignments.update");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }

  const db = await getDb();
  const validatedData = endAssignmentSchema.parse(data);

  const existingAssignment = await db.query.asignacionesContratos.findFirst({
    where: eq(asignacionesContratos.id, validatedData.assignmentId)
  });

  if (!existingAssignment) {
    throw new Error("Assignment not found");
  }
  if (existingAssignment.fechaFin) {
    throw new Error("Cannot edit an assignment that has an end date.");
  }

  await db.update(asignacionesContratos)
    .set({ fechaFin: validatedData.fechaFin, estado: "finalizado" })
    .where(eq(asignacionesContratos.id, validatedData.assignmentId));

  await db.insert(historialRelacionLaboral).values({
    empleadoId: existingAssignment.empleadoId,
    fechaEvento: validatedData.fechaFin,
    tipoEvento: "egreso",
    descripcion: `Assignment ended for project`,
    obraId: existingAssignment.obraId,
    createdBy: user?.id,
  });

  revalidatePath(`/projects/${existingAssignment.obraId}`);
  revalidatePath(`/employees/${existingAssignment.empleadoId}`);

  return {
    ...existingAssignment,
    fechaFin: validatedData.fechaFin,
    estado: "finalizado",
  };
}

export async function updateAssignment(assignmentId: string, data: any) {
  const hasPermission = await checkPermission("assignments.update");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }

  const db = await getDb();

  const existingAssignment = await db.query.asignacionesContratos.findFirst({
    where: eq(asignacionesContratos.id, assignmentId),
    columns: { fechaFin: true }
  });

  if (existingAssignment?.fechaFin) {
    throw new Error("Cannot edit an assignment that has an end date.");
  }

  const validatedData = createAssignmentSchema.parse(data);

  const [updatedAssignment] = await db.update(asignacionesContratos)
    .set({
      empleadoId: validatedData.empleadoId,
      obraId: validatedData.obraId,
      fechaInicio: validatedData.fechaInicio,
      fechaFin: validatedData.fechaFin,
      tipoContrato: validatedData.tipoContrato,
      categoria: validatedData.categoria,
      salario: validatedData.salario?.toString(),
      observaciones: validatedData.observaciones,
    })
    .where(eq(asignacionesContratos.id, assignmentId))
    .returning();

  revalidatePath(`/projects/${updatedAssignment.obraId}`);
  revalidatePath(`/employees/${updatedAssignment.empleadoId}`);

  return updatedAssignment;
}

export async function updateProject(projectId: string, data: any) {
  const hasPermission = await checkPermission("projects.update");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }

  const db = await getDb();
  const validatedData = createProjectSchema.parse(data);

  const [updatedProject] = await db.update(obras)
    .set({
      nombre: validatedData.nombre,
      codigo: validatedData.codigo,
      ubicacion: validatedData.ubicacion,
      fechaInicio: validatedData.fechaInicio,
      fechaFinEstimada: validatedData.fechaFinEstimada,
      presupuesto: validatedData.presupuesto?.toString(),
      descripcion: validatedData.descripcion,
    })
    .where(eq(obras.id, projectId))
    .returning();

  revalidatePath("/projects");
  revalidatePath(`/projects/${updatedProject.id}`);

  return updatedProject;
}

export async function getProjects() {
  const hasPermission = await checkPermission("projects.read");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }
  const db = await getDb();
  const projects = await db.query.obras.findMany({
    orderBy: [desc(obras.createdAt)],
  });

  const counts = await db.select({
    obraId: asignacionesContratos.obraId,
    count: count()
  }).from(asignacionesContratos).groupBy(asignacionesContratos.obraId);

  return projects.map(p => ({
    ...p,
    asignaciones_contratos: [{ count: counts.find(c => c.obraId === p.id)?.count || 0 }]
  }));
}

export async function getProjectById(id: string) {
  const hasPermission = await checkPermission("projects.read");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }
  const db = await getDb();
  return db.query.obras.findFirst({ where: eq(obras.id, id) });
}

export async function getProjectAssignments(projectId: string) {
  const hasPermission = await checkPermission("projects.read");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }
  const db = await getDb();
  return db.query.asignacionesContratos.findMany({
    where: eq(asignacionesContratos.obraId, projectId),
    with: {
      empleado: true,
    },
    orderBy: [desc(asignacionesContratos.fechaInicio)],
  });
}
