import { enforceAuthentication } from "@/lib/services/auth/protection";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/Navbar";
import { SidebarProvider } from "@/lib/context/SidebarContext";
import { UserProfile } from "@/components/dashboard/user-profile";
import { getAuthenticatedUser } from "@/lib/services/auth/user";
import { checkPermission } from "@/lib/services/auth/permissions";
import { PermissionGate } from "@/components/auth/permission-gate";

type NavLink = {
  title: string;
  icon: string;
  href: string;
  permission: string;
};

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
      {
        title: "Sign Up Codes",
        icon: "CodeSquare",
        href: "/admin/signup-codes",
        permission: "users.read_signup_codes",
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

  const allowedLinkGroups = await Promise.all(
    navLinkGroups.map(async (group) => {
      const allowedLinks = (
        await Promise.all(
          group.links.map(async (link) => {
            const hasPerm = await checkPermission(link.permission);
            return hasPerm ? link : null;
          })
        )
      ).filter((link): link is NavLink => link !== null);

      return { ...group, links: allowedLinks };
    })
  ).then((groups) => groups.filter((group) => group.links.length > 0));

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
