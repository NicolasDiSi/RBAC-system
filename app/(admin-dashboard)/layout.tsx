import { enforceAuthentication } from "@/lib/services/auth/protection";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/Navbar";
import { SidebarProvider } from "@/lib/context/SidebarContext";
import { UserProfile } from "@/components/dashboard/user-profile";
import { getAuthenticatedUser } from "@/lib/services/auth/user";
import { checkPermission } from "@/lib/services/auth/permissions";

const navLinks = [
  {
    title: "Dashboard",
    icon: "LayoutDashboard",
    href: "/dashboard",
    permission: "dashboard.view",
  },
  {
    title: "User Management",
    icon: "Users",
    href: "/admin/users",
    permission: "users.read",
  },
  {
    title: "Employees",
    icon: "Briefcase",
    href: "/employees",
    permission: "employees.read",
  },
  {
    title: "Projects",
    icon: "Building2",
    href: "/projects",
    permission: "projects.read",
  },
  {
    title: "Documents",
    icon: "FileText",
    href: "/documents",
    permission: "documents.read",
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

  const allowedLinks = [];
  for (const link of navLinks) {
    const hasPerm = await checkPermission(link.permission);
    if (hasPerm) {
      allowedLinks.push(link);
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar links={allowedLinks} />
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
