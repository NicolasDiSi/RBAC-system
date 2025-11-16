import { enforceAuthentication } from "@/lib/services/auth/protection";
import { checkPermission } from "@/lib/services/auth/permissions";
import { getSupabaseServerClient } from "@/lib/services/supabase/server";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Users, Building2, TrendingUp } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ReportsPage() {
  await enforceAuthentication();
  const canView = await checkPermission("reports.view");

  if (!canView) {
    redirect("/unauthorized");
  }

  const supabase = await getSupabaseServerClient();

  // Fetch summary statistics
  const { count: totalEmployees } = await supabase.from("empleados").select("*", { count: "exact", head: true });

  const { count: activeEmployees } = await supabase
    .from("empleados")
    .select("*", { count: "exact", head: true })
    .eq("estado", "activo");

  const { count: totalProjects } = await supabase.from("obras").select("*", { count: "exact", head: true });

  const { count: activeProjects } = await supabase
    .from("obras")
    .select("*", { count: "exact", head: true })
    .eq("estado", "en_curso");

  const { count: totalAssignments } = await supabase
    .from("asignaciones_contratos")
    .select("*", { count: "exact", head: true });

  const reports = [
    {
      title: "Employee Report",
      description: "Complete list of all employees with their details",
      icon: Users,
      stats: `${activeEmployees} active / ${totalEmployees} total`,
      color: "text-green-600",
    },
    {
      title: "Project Report",
      description: "Overview of all construction projects and their status",
      icon: Building2,
      stats: `${activeProjects} active / ${totalProjects} total`,
      color: "text-orange-600",
    },
    {
      title: "Assignment Report",
      description: "Employee assignments across all projects",
      icon: TrendingUp,
      stats: `${totalAssignments} total assignments`,
      color: "text-blue-600",
    },
    {
      title: "Document Report",
      description: "Document status and expiration tracking",
      icon: FileText,
      stats: "All documents",
      color: "text-purple-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and export reports for your HR data</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {reports.map((report) => (
            <Card key={report.title}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <report.icon className={`h-5 w-5 ${report.color}`} />
                      {report.title}
                    </CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{report.stats}</p>
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Custom Report Builder</CardTitle>
            <CardDescription>Create custom reports with specific filters and date ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Build Custom Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
