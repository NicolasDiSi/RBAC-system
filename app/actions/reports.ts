"use server"

import { checkPermission } from "@/lib/services/auth/permissions"
import { getDb } from "@/lib/db"
import { empleados, obras, asignacionesContratos } from "@/lib/db/schema"
import { eq, count } from "drizzle-orm"

export async function getReportStats() {
  const canView = await checkPermission("reports.view");
  if (!canView) {
    throw new Error("Unauthorized");
  }

  const db = await getDb();

  const [
    [totalEmployeesResult],
    [activeEmployeesResult],
    [totalProjectsResult],
    [activeProjectsResult],
    [totalAssignmentsResult],
  ] = await Promise.all([
    db.select({ count: count() }).from(empleados),
    db.select({ count: count() }).from(empleados).where(eq(empleados.estado, "activo")),
    db.select({ count: count() }).from(obras),
    db.select({ count: count() }).from(obras).where(eq(obras.estado, "en_curso")),
    db.select({ count: count() }).from(asignacionesContratos),
  ]);

  return {
    totalEmployees: totalEmployeesResult?.count ?? 0,
    activeEmployees: activeEmployeesResult?.count ?? 0,
    totalProjects: totalProjectsResult?.count ?? 0,
    activeProjects: activeProjectsResult?.count ?? 0,
    totalAssignments: totalAssignmentsResult?.count ?? 0,
  };
}