import { enforceAuthentication } from "@/lib/services/auth/protection";
import { checkPermission } from "@/lib/services/auth/permissions";
import { getProjectById } from "@/app/actions/projects";
import { ProjectForm } from "@/components/projects/project-form";
import { redirect, notFound } from "next/navigation";

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  await enforceAuthentication();
  const canUpdate = await checkPermission("projects.update");

  if (!canUpdate) {
    redirect("/unauthorized");
  }

  const project = await getProjectById(params.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Project</h1>
        <p className="text-muted-foreground">Update the information for the project.</p>
      </div>
      <ProjectForm project={project} />
    </div>
  );
}
