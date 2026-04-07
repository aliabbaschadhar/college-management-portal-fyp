"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getNavItems } from "@/lib/sidebar-config";
import type { UserRole } from "@/types";

interface DashboardShellProps {
  children: React.ReactNode;
  role: UserRole;
  roleLabel: string;
}

export function DashboardShell({ children, role, roleLabel }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = getNavItems(role);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        navItems={navItems}
        roleLabel={roleLabel}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          roleLabel={roleLabel}
          onMenuClick={() => setMobileOpen(!mobileOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
