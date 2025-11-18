"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/lib/context/SidebarContext";
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  LayoutDashboard,
  LucideIcon,
  LineChart,
  Shield,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  FileText,
  LineChart,
  Shield,
};

type NavLink = {
  title: string;
  icon: string;
  href: string;
  permission: string;
};

type NavGroup = {
  title: string;
  links: NavLink[];
};

export function Sidebar({ groups = [] }: { groups: NavGroup[] }) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        "flex-col border-r bg-background transition-all duration-300 ease-in-out",
        "hidden sm:flex", // Hide on small screens, flex on sm and up
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-center px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className={cn(isCollapsed && "hidden")}>HR</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 px-4 sm:px-6 sm:py-4">
        <TooltipProvider>
          {groups.map((group) => (
            <div key={group.title} className="space-y-2">
              {!isCollapsed && (
                <h2 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </h2>
              )}
              {group.links.map((link) => {
                const Icon = iconMap[link.icon];
                return (
                  <Tooltip key={link.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg text-muted-foreground transition-all hover:text-primary",
                          pathname.startsWith(link.href) &&
                            "bg-muted text-primary",
                          isCollapsed ? "justify-center" : "px-3 py-2"
                        )}
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                        <span className={cn(isCollapsed && "hidden")}>
                          {link.title}
                        </span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={5}>
                      {link.title}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  );
}
