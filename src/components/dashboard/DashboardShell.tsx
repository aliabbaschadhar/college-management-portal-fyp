"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getNavItems } from "@/lib/sidebar-config";
import type { UserRole } from "@/types";
import { api } from "@/lib/axios";
import { useAuth } from "@clerk/nextjs";

interface DashboardShellProps {
  children: React.ReactNode;
  role: UserRole;
  roleLabel: string;
}

export function DashboardShell({ children, role, roleLabel }: DashboardShellProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevRole, setPrevRole] = useState(role);
  const [navItems, setNavItems] = useState(() => getNavItems(role));
  const pathname = usePathname();

  if (role !== prevRole) {
    setPrevRole(role);
    setNavItems(getNavItems(role));
  }

  useEffect(() => {
    if (pathname === "/dashboard/feedback") {
      localStorage.setItem("lastViewedFeedback", Date.now().toString());
    }
  }, [pathname]);

  useEffect(() => {
    if (role !== "admin" || !isLoaded || !isSignedIn) return;

    let isMounted = true;

    const fetchPendingCounts = async () => {
      try {
        const [admissionsRes, onboardingRes, feedbackRes] = await Promise.all([
          api.get<unknown[]>("/api/admissions?status=Pending&limit=100"),
          api.get<unknown[]>("/api/onboarding?status=Pending"),
          api.get<{ date: string }[]>("/api/feedback"),
        ]);

        if (!isMounted) return;

        const admissionsCount = Array.isArray(admissionsRes.data) ? admissionsRes.data.length : 0;
        const onboardingCount = Array.isArray(onboardingRes.data) ? onboardingRes.data.length : 0;
        const totalAdmissionsCount = admissionsCount + onboardingCount;
        
        let feedbackCount = 0;
        if (Array.isArray(feedbackRes.data) && pathname !== "/dashboard/feedback") {
          const lastViewed = localStorage.getItem("lastViewedFeedback");
          const lastViewedTime = lastViewed ? parseInt(lastViewed) : 0;
          feedbackCount = feedbackRes.data.filter(
            (f) => new Date(f.date).getTime() > lastViewedTime
          ).length;
        }

        setNavItems((prev) =>
          prev.map((item) => {
            if (item.title === "Admissions") {
              return { ...item, badge: totalAdmissionsCount > 0 ? totalAdmissionsCount : undefined };
            }
            if (item.title === "Feedback") {
              return { ...item, badge: feedbackCount > 0 ? feedbackCount : undefined };
            }
            return item;
          })
        );
      } catch (err) {
        console.error("Failed to fetch pending counts:", err);
      }
    };

    fetchPendingCounts();
    const interval = setInterval(fetchPendingCounts, 30000); // Check every 30s

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [role, pathname, isLoaded, isSignedIn]);

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
          onMenuClick={() => setMobileOpen(!mobileOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
