"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getNavItems } from "@/lib/sidebar-config";
import type { UserRole } from "@/types";
import { api } from "@/lib/axios";

interface DashboardShellProps {
  children: React.ReactNode;
  role: UserRole;
  roleLabel: string;
}

export function DashboardShell({ children, role, roleLabel }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevRole, setPrevRole] = useState(role);
  const [navItems, setNavItems] = useState(() => getNavItems(role));
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (role !== prevRole) {
    setPrevRole(role);
    setNavItems(getNavItems(role));
  }

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsNavigating(false);
  }

  useEffect(() => {
    if (pathname === "/dashboard/feedback") {
      localStorage.setItem("lastViewedFeedback", Date.now().toString());
    }
  }, [pathname]);

  useEffect(() => {
    if (role !== "admin") return;

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
  }, [role, pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {isNavigating && (
        <>
          <style>{`
            @keyframes routeProgress {
              0% { width: 0%; }
              50% { width: 70%; }
              100% { width: 90%; }
            }
            .animate-route-progress {
              animation: routeProgress 2.5s ease-out forwards;
            }
          `}</style>
          <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-muted/20">
            <div className="h-full bg-brand-primary animate-route-progress shadow-[0_0_8px_var(--color-brand-primary)]" />
          </div>
        </>
      )}
      <Sidebar
        navItems={navItems}
        roleLabel={roleLabel}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onNavigate={() => setIsNavigating(true)}
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
