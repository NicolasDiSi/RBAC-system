import { redirect } from "next/navigation"
import { getCurrentUser, checkPermission } from "@/lib/auth/permissions"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DocumentUploadForm } from "@/components/documents/document-upload-form"

export default async function UploadDocumentPage() {

  const supabase = await getSupabaseServerClient()

  // Fetch all employees for the dropdown
  const { data: employees } = await supabase.from("empleados").select("*").order("apellido")

  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Upload Document</h1>
          <p className="text-muted-foreground">Upload a new document for an employee</p>
        </div>
        <DocumentUploadForm employees={employees || []} />
      </div>
    </AdminLayout>
  )
}
