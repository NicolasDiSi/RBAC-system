import { redirect } from "next/navigation"
import { checkPermission } from "@/lib/services/auth/permissions"
import { getSupabaseServerClient } from "@/lib/services/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DocumentsTable } from "@/components/documents/documents-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function DocumentsPage() {

  const supabase = await getSupabaseServerClient()

  // Fetch all documents with employee information
  const { data: documents } = await supabase
    .from("documentos")
    .select(`
      *,
      empleado:empleados(nombre, apellido, dni)
    `)
    .order("fecha_subida", { ascending: false })

  const canCreate = await checkPermission("documents.create")

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Document Management</h1>
            <p className="text-muted-foreground">Manage employee documents and track expiration dates</p>
          </div>
          {canCreate && (
            <Link href="/documents/upload">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Upload Document
              </Button>
            </Link>
          )}
        </div>
        <DocumentsTable documents={documents || []} />
      </div>
    </AdminLayout>
  )
}
