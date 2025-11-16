import { enforceAuthentication } from "@/lib/services/auth/protection";
import { checkPermission } from "@/lib/services/auth/permissions";
import { ProjectForm } from "@/components/projects/project-form";
import { redirect } from "next/navigation";

export default async function NewProjectPage() {
  await enforceAuthentication();
  const canCreate = await checkPermission("projects.create");

  if (!canCreate) {
    redirect("/unauthorized");
  }

  return (
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add New Project</h1>
          <p className="text-muted-foreground">Enter project information to create a new construction project</p>
        </div>
        <ProjectForm />
      </div>
  );
}
