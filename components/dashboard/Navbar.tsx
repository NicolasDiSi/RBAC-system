"use client";

import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/lib/context/SidebarContext";
import { ReactNode } from "react";

export function Navbar({ children }: { children: ReactNode }) {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <header className="flex items-center justify-between p-4 bg-background border-b">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        {isCollapsed ? <Menu /> : <X />}
      </Button>
      <div className="flex items-center gap-4">
        {children}
      </div>
    </header>
  );
}
