import { enforceAuthentication } from "@/lib/services/auth/protection";
import { checkPermission } from "@/lib/services/auth/permissions";
import { getSupabaseServerClient } from "@/lib/services/supabase/server";
import { ProjectsTable } from "@/components/projects/projects-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  await enforceAuthentication();
  const canView = await checkPermission("projects.read");

  if (!canView) {
    redirect("/unauthorized");
  }

  const supabase = await getSupabaseServerClient();

  // Fetch all projects with assignment counts
  const { data: projects } = await supabase
    .from("obras")
    .select(
      `
      *,
      asignaciones_contratos(count)
    `
    )
    .order("created_at", { ascending: false });

  const canCreate = await checkPermission("projects.create");

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Project Management</h1>
            <p className="text-muted-foreground">Manage construction projects and employee assignments</p>
          </div>
          {canCreate && (
            <Link href="/projects/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Project
              </Button>
            </Link>
          )}
        </div>
        <ProjectsTable projects={projects || []} />
      </div>
  );
}
