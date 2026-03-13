"use server"

import { checkPermission } from "@/lib/services/auth/permissions"
import { getDb } from "@/lib/db"
import { empleados, obras, asignacionesContratos, documentos, historialRelacionLaboral } from "@/lib/db/schema"
import { eq, count, desc } from "drizzle-orm"

export async function getDashboardStats() {
  const canView = await checkPermission("dashboard.view");
  if (!canView) {
    throw new Error("Unauthorized");
  }

  const db = await getDb();

  const [
    [totalEmployeesResult],
    [totalProjectsResult],
    [activeAssignmentsResult],
    [pendingDocumentsResult],
    employeesByContract,
    projectsByStatus,
    recentHistory
  ] = await Promise.all([
    db.select({ count: count() }).from(empleados).where(eq(empleados.estado, "activo")),
    db.select({ count: count() }).from(obras).where(eq(obras.estado, "en_curso")),
    db.select({ count: count() }).from(asignacionesContratos).where(eq(asignacionesContratos.estado, "activo")),
    db.select({ count: count() }).from(documentos).where(eq(documentos.estado, "por_vencer")),
    db.select({ name: empleados.tipoContrato, value: count() })
      .from(empleados)
      .where(eq(empleados.estado, "activo"))
      .groupBy(empleados.tipoContrato),
    db.select({ name: obras.estado, value: count() })
      .from(obras)
      .groupBy(obras.estado),
    db.query.historialRelacionLaboral.findMany({
      with: {
        empleado: { columns: { nombre: true, apellido: true } },
      },
      orderBy: [desc(historialRelacionLaboral.createdAt)],
      limit: 10,
    })
  ]);

  const formatLabel = (str: string | null) => {
    if (!str) return "Unknown";
    const withSpaces = str.replace(/_/g, " ");
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
  };

  return {
    totalEmployees: totalEmployeesResult?.count ?? 0,
    totalProjects: totalProjectsResult?.count ?? 0,
    activeAssignments: activeAssignmentsResult?.count ?? 0,
    pendingDocuments: pendingDocumentsResult?.count ?? 0,
    employeesByContract: employeesByContract.map((item) => ({
      name: formatLabel(item.name),
      value: Number(item.value),
    })),
    projectsByStatus: projectsByStatus.map((item) => ({
      name: formatLabel(item.name),
      value: Number(item.value),
    })),
    recentHistory,
  };
}