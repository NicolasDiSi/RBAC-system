import { enforceAuthentication } from "@/lib/services/auth/protection";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Navbar } from "@/components/dashboard/Navbar";
import { SidebarProvider } from "@/lib/context/SidebarContext";
import { UserProfile } from "@/components/dashboard/user-profile";
import { getAuthenticatedUser } from "@/lib/services/auth/user";

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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
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
