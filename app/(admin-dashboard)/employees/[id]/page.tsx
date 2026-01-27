import { redirect, notFound } from "next/navigation"
import { EmployeeDetail } from "@/components/employees/employee-detail"
import { checkPermission } from "@/lib/services/auth/permissions"
import { getEmployeeById, getEmployeeAssignments, getEmployeeHistory } from "@/app/actions/employees"
import { getDocumentsByEmployeeId } from "@/app/actions/documents"

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const employeeId = String(id);

  const permissions = {
    canUpdate: await checkPermission("employees.update"),
    canDeactivate: await checkPermission("employees.deactivate"),
  }

  // Fetch employee with related data
  const employee = await getEmployeeById(employeeId)

  if (!employee) {
    notFound()
  }

  // Fetch assignments
  const assignments = await getEmployeeAssignments(employeeId)

  // Fetch documents
  const documents = await getDocumentsByEmployeeId(employeeId)

  // Fetch history
  const history = await getEmployeeHistory(employeeId)

  return (
      <EmployeeDetail
        employee={employee}
        assignments={assignments || []}
        documents={documents || []}
        history={history || []}
        permissions={permissions}
      />
  )
}
