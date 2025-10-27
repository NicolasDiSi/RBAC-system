import { redirect } from "next/navigation"
import { getCurrentUser, checkPermission } from "@/lib/auth/permissions"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ProjectForm } from "@/components/projects/project-form"

export default async function NewProjectPage() {
  return (
    <AdminLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add New Project</h1>
          <p className="text-muted-foreground">Enter project information to create a new construction project</p>
        </div>
        <ProjectForm />
      </div>
    </AdminLayout>
  )
}
