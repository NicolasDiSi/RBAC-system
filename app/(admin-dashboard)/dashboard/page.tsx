import { enforceAuthentication } from "@/lib/services/auth/protection";
import { checkPermission } from "@/lib/services/auth/permissions";
import { getSupabaseServerClient } from "@/lib/services/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Briefcase, FileText, TrendingUp, UserCheck, Clock } from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/Navbar";
import { SidebarProvider } from "@/lib/context/SidebarContext";

export default async function DashboardPage() {
	const user = await enforceAuthentication();
	const canView = await checkPermission("dashboard.view");

	if (!canView) {
		redirect("/unauthorized");
	}

	const supabase = await getSupabaseServerClient();

	// Fetch KPI data
	const { count: totalEmployees } = await supabase
		.from("empleados")
		.select("*", { count: "exact", head: true })
		.eq("estado", "activo");

	const { count: totalProjects } = await supabase
		.from("obras")
		.select("*", { count: "exact", head: true })
		.eq("estado", "en_curso");

	const { count: activeAssignments } = await supabase
		.from("asignaciones_contratos")
		.select("*", { count: "exact", head: true })
		.eq("estado", "activo");

	const { count: pendingDocuments } = await supabase
		.from("documentos")
		.select("*", { count: "exact", head: true })
		.eq("estado", "por_vencer");

	// Fetch data for charts
	const { data: employeesByContract } = await supabase
		.from("empleados")
		.select("tipo_contrato")
		.eq("estado", "activo");

	const { data: projectsByStatus } = await supabase.from("obras").select("estado");

	const { data: recentHistory } = await supabase
		.from("historial_relacion_laboral")
		.select(
			`
      *,
      empleado:empleados(nombre, apellido)
    `
		)
		.order("created_at", { ascending: false })
		.limit(10);

	const canViewReports = await checkPermission("reports.view");

	const quickLinks = [
		{
			title: "User Management",
			description: "Manage users and permissions",
			icon: Users,
			href: "/admin/users",
			color: "text-blue-600",
		},
		{
			title: "Employees",
			description: "View and manage employees",
			icon: Briefcase,
			href: "/employees",
			color: "text-green-600",
		},
		{
			title: "Projects",
			description: "Manage construction projects",
			icon: Building2,
			href: "/projects",
			color: "text-orange-600",
		},
		{
			title: "Documents",
			description: "Access employee documents",
			icon: FileText,
			href: "/documents",
			color: "text-purple-600",
		},
	];

	return (
		<SidebarProvider>
			<div className="flex min-h-screen">
				<Sidebar />
				<div className="flex flex-col flex-1">
					<Navbar />
					<main className="flex-1 container py-8 px-4 space-y-8">
						<div>
							<h2 className="text-3xl font-bold">Welcome back, {user.name}!</h2>
							<p className="text-muted-foreground mt-1">Here's an overview of your HR system</p>
						</div>
						{/* Quick Links */}
						<section>
							<h3 className="text-xl font-semibold mb-4">Quick Access</h3>
							<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
								{quickLinks.map((link) => (
									<Link key={link.href} href={link.href}>
										<Card className="transition-all hover:shadow-md hover:border-primary/50">
											<CardHeader>
												<link.icon className={`h-8 w-8 ${link.color}`} />
												<CardTitle className="mt-4">{link.title}</CardTitle>
												<CardDescription>{link.description}</CardDescription>
											</CardHeader>
										</Card>
									</Link>
								))}
							</div>
						</section>
						<section className="space-y-8">
							{/* KPI Cards */}
							<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
								<Card>
									<CardHeader className="flex flex-row items-center justify-between pb-2">
										<CardTitle className="text-sm font-medium text-muted-foreground">
											Active Employees
										</CardTitle>
										<UserCheck className="h-4 w-4 text-green-600" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{totalEmployees || 0}</div>
										<p className="text-xs text-muted-foreground mt-1">Currently employed</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row items-center justify-between pb-2">
										<CardTitle className="text-sm font-medium text-muted-foreground">
											Active Projects
										</CardTitle>
										<Building2 className="h-4 w-4 text-orange-600" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{totalProjects || 0}</div>
										<p className="text-xs text-muted-foreground mt-1">In progress</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row items-center justify-between pb-2">
										<CardTitle className="text-sm font-medium text-muted-foreground">
											Active Assignments
										</CardTitle>
										<TrendingUp className="h-4 w-4 text-blue-600" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{activeAssignments || 0}</div>
										<p className="text-xs text-muted-foreground mt-1">Current assignments</p>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row items-center justify-between pb-2">
										<CardTitle className="text-sm font-medium text-muted-foreground">
											Pending Documents
										</CardTitle>
										<Clock className="h-4 w-4 text-purple-600" />
									</CardHeader>
									<CardContent>
										<div className="text-2xl font-bold">{pendingDocuments || 0}</div>
										<p className="text-xs text-muted-foreground mt-1">Expiring soon</p>
									</CardContent>
								</Card>
							</div>

							{/* Charts */}
							{canViewReports && (
								<DashboardCharts
									employeesByContract={employeesByContract || []}
									projectsByStatus={projectsByStatus || []}
								/>
							)}

							{/* Recent Activity */}
							<RecentActivity history={recentHistory || []} />
						</section>
					</main>
				</div>
			</div>
		</SidebarProvider>
	);
}
