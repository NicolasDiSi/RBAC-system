import { enforceAuthentication } from "@/lib/services/auth/protection";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/Navbar";
import { SidebarProvider } from "@/lib/context/SidebarContext";
import { UserProfile } from "@/components/dashboard/user-profile";
import { getAuthenticatedUser } from "@/lib/services/auth/user";
import { checkPermission } from "@/lib/services/auth/permissions";

const navLinkGroups = [
  {
    title: "Management",
    links: [
      {
        title: "Dashboard",
        icon: "LayoutDashboard",
        href: "/dashboard",
        permission: "dashboard.view",
      },
      {
        title: "Projects",
        icon: "Building2",
        href: "/projects",
        permission: "projects.read",
      },
      {
        title: "Employees",
        icon: "Briefcase",
        href: "/employees",
        permission: "employees.read",
      },
      {
        title: "Documents",
        icon: "FileText",
        href: "/documents",
        permission: "documents.read",
      },
      {
        title: "Reports",
        icon: "LineChart",
        href: "/reports",
        permission: "reports.read",
      },
    ],
  },
  {
    title: "Administration",
    links: [
      {
        title: "Users",
        icon: "Users",
        href: "/admin/users",
        permission: "users.read",
      },
      {
        title: "Roles",
        icon: "Shield",
        href: "/admin/roles",
        permission: "roles.read",
      },
    ],
  },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();
  await enforceAuthentication();

  if (!user) {
    return null;
  }

  const allowedLinkGroups = [];
  for (const group of navLinkGroups) {
    const allowedLinks = [];
    for (const link of group.links) {
      const hasPerm = await checkPermission(link.permission);
      if (hasPerm) {
        allowedLinks.push(link);
      }
    }
    if (allowedLinks.length > 0) {
      allowedLinkGroups.push({ ...group, links: allowedLinks });
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar groups={allowedLinkGroups} />
        <div className="flex flex-col flex-1">
          <Navbar>
            <UserProfile user={user} />
          </Navbar>
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
