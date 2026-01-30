"use server"

import { revalidatePath } from "next/cache"
import { checkPermission } from "@/lib/services/auth/permissions"
import { getAuthenticatedUser } from "@/lib/services/auth/user"
import { getDb } from "@/lib/db"
import { empleados, historialRelacionLaboral, asignacionesContratos } from "@/lib/db/schema"
import { eq, desc, asc } from "drizzle-orm"

import { z } from "zod";
import { createEmployeeSchema, editEmployeeSchema } from "@/lib/validations/employee-schema";
import { deactivateEmployeeSchema } from "@/lib/validations/deactivation-schema"

export async function createEmployee(data: any) {
  const hasPermission = await checkPermission("employees.create")
  if (!hasPermission) {
    return { success: false, message: "Unauthorized", errors: null };
  }

  const user = await getAuthenticatedUser()

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

  try {
    const db = await getDb();
    const [employee] = await db.insert(empleados).values({
        nombre: validatedData.nombre,
        apellido: validatedData.apellido,
        dni: validatedData.dni,
        cuil: validatedData.cuil,
        fechaNacimiento: validatedData.fechaNacimiento,
        telefono: validatedData.telefono,
        email: validatedData.email,
        direccion: validatedData.direccion,
        fechaIngreso: validatedData.fechaIngreso,
        tipoContrato: validatedData.tipoContrato,
        categoria: validatedData.categoria,
        empresaTercera: validatedData.empresaTercera,
        observaciones: validatedData.observaciones,
        estado: "activo",
        createdBy: user?.id,
      }).returning();

    // Create history entry for employee creation
    await db.insert(historialRelacionLaboral).values({
      empleadoId: employee.id,
      fechaEvento: validatedData.fechaIngreso,
      tipoEvento: "ingreso",
      descripcion: `Employee joined the company as ${validatedData.categoria || "employee"}`,
      categoriaNueva: validatedData.categoria,
      createdBy: user?.id,
    });

    revalidatePath("/employees")
    return { success: true, message: "Employee created successfully!", errors: null };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Database error", errors: null };
  }
}

export async function getEmployees(sort: 'recent' | 'alphabetical' = 'recent') {
  const hasPermission = await checkPermission("employees.read");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }
  const db = await getDb();
  const orderBy = sort === 'recent' ? [desc(empleados.createdAt)] : [asc(empleados.apellido)];
  return db.query.empleados.findMany({ orderBy });
}

export async function getEmployeeById(id: string) {
  const hasPermission = await checkPermission("employees.read");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }
  const db = await getDb();
  return db.query.empleados.findFirst({ where: eq(empleados.id, id) });
}

export async function getEmployeeAssignments(employeeId: string) {
  const hasPermission = await checkPermission("employees.read");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }
  const db = await getDb();
  return db.query.asignacionesContratos.findMany({
    where: eq(asignacionesContratos.empleadoId, employeeId),
    with: { obra: true },
    orderBy: [desc(asignacionesContratos.fechaInicio)]
  });
}

export async function getEmployeeHistory(employeeId: string) {
  const hasPermission = await checkPermission("employees.read");
  if (!hasPermission) {
    throw new Error("Unauthorized");
  }
  const db = await getDb();
  return db.query.historialRelacionLaboral.findMany({
    where: eq(historialRelacionLaboral.empleadoId, employeeId),
    with: { obra: { columns: { nombre: true } } },
    orderBy: [desc(historialRelacionLaboral.fechaEvento)]
  });
}

export async function updateEmployee(id: string, data: any) {
  const hasPermission = await checkPermission("employees.update")
  if (!hasPermission) {
    return { success: false, message: "Unauthorized", errors: null };
  }

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

  try {
    const db = await getDb();
    await db.update(empleados).set({
        nombre: validatedData.nombre,
        apellido: validatedData.apellido,
        dni: validatedData.dni,
        cuil: validatedData.cuil,
        fechaNacimiento: validatedData.fechaNacimiento,
        telefono: validatedData.telefono,
        email: validatedData.email,
        direccion: validatedData.direccion,
        fechaIngreso: validatedData.fechaIngreso,
        tipoContrato: validatedData.tipoContrato,
        categoria: validatedData.categoria,
        empresaTercera: validatedData.empresaTercera,
        observaciones: validatedData.observaciones,
    }).where(eq(empleados.id, id));

    revalidatePath("/employees")
    revalidatePath(`/employees/${id}`)
    return { success: true, message: "Employee updated successfully!", errors: null };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Database error", errors: null };
  }
}

export async function deactivateEmployee(employeeId: string, data: any) {
  const hasPermission = await checkPermission("employees.deactivate");
  if (!hasPermission) {
    return { success: false, message: "Unauthorized", errors: null };
  }

  const user = await getAuthenticatedUser();

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

  try {
    const db = await getDb();
    
    await db.update(empleados).set({
        estado: "inactivo",
        fechaEgreso: validatedData.fechaEgreso,
      }).where(eq(empleados.id, employeeId));

    // Create history entry for employee deactivation
    await db.insert(historialRelacionLaboral).values({
      empleadoId: employeeId,
      fechaEvento: validatedData.fechaEgreso,
      tipoEvento: "egreso",
      descripcion: `Employee deactivated by ${user?.email}`,
      createdBy: user?.id,
    });

    revalidatePath("/employees");
    revalidatePath(`/employees/${employeeId}`);
    return { success: true, message: "Employee deactivated successfully!", errors: null };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Database error", errors: null };
  }
}
