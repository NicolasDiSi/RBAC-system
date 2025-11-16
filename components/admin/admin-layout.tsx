import type React from "react"
import { getAuthenticatedUser } from "@/lib/services/auth/user"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Shield, LayoutDashboard, Building2, FileText, Briefcase, BarChart3 } from "lucide-react"

export async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser()

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Roles", href: "/admin/roles", icon: Shield },
    { name: "Employees", href: "/employees", icon: Briefcase },
    { name: "Projects", href: "/projects", icon: Building2 },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Reports", href: "/reports", icon: BarChart3 },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-xl font-semibold">
              HR System
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.role?.name}</p>
            </div>
            <form action="/api/auth/logout" method="POST">
              <Button type="submit" variant="ghost" size="sm">
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6 px-4">{children}</main>
    </div>
  )
}
