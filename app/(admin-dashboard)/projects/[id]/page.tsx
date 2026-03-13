import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/project-detail";
import { checkPermission } from "@/lib/services/auth/permissions";
import { getProjectById, getProjectAssignments } from "@/app/actions/projects";
import { getEmployees } from "@/app/actions/employees";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	// Fetch project
	const project = await getProjectById(id);

	if (!project) {
		notFound();
	}

	// Fetch assignments with employee details
	const assignments = await getProjectAssignments(id);

	// Fetch all employees for assignment form
	const employeesList = await getEmployees('alphabetical');

	const permissions = {
		canUpdate: await checkPermission("projects.update"),
	};
	return (
		<ProjectDetail
			permissions={permissions}
			project={project}
			assignments={assignments}
			employees={employeesList}
		/>
	);
}
