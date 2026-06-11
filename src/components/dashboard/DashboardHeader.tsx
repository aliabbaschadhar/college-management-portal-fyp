"use client";

import { Bell, Menu } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "@/lib/axios";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  audience: "All" | "Students" | "Faculty";
  priority: "Low" | "Medium" | "High";
}

interface Fee {
  id: string;
  type: string;
  amount: number;
  dueDate: string;
  status: string;
}

function formatSemester(sem: number) {
  if (sem === 1) return "1st";
  if (sem === 2) return "2nd";
  if (sem === 3) return "3rd";
  return `${sem}th`;
}

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const [allAnnouncements, setAllAnnouncements] = useState<Announcement[]>([]);
  const [unpaidFees, setUnpaidFees] = useState<Fee[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [dbProfile, setDbProfile] = useState<{
    name: string | null;
    role: string;
    faculty?: { department: string; specialization: string } | null;
    student?: { department: string; semester: number; shift: string } | null;
  } | null>(null);

  const { user } = useUser();
  const userId = user?.id || "anonymous";
  const role = (user?.publicMetadata?.role as string || "student").toLowerCase();
  const isAdmin = role === "admin";
  const pathname = usePathname();

  useEffect(() => {
    if (userId && userId !== "anonymous") {
      api.get("/api/me")
        .then((res) => {
          setDbProfile(res.data);
        })
        .catch((err) => console.error("Failed to fetch user profile in header:", err));
    }
  }, [userId]);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await api.get<Announcement[]>("/api/announcements");
      const annData = Array.isArray(res.data) ? res.data : [];
      setAllAnnouncements(annData);

      if (role === "student") {
        const feesRes = await api.get<Fee[]>("/api/fees?status=Unpaid").catch(() => null);
        setUnpaidFees(Array.isArray(feesRes?.data) ? feesRes.data : []);
      }
    } catch (err) {
      console.error("Failed to fetch announcements/fees for bell:", err);
    }
  }, [role]);

  // Load user-scoped dismissed announcements from localStorage on mount, user change, or route transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);

    const syncDismissed = () => {
      if (userId) {
        const stored = localStorage.getItem(`dismissed_announcements_${userId}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setTimeout(() => {
              setDismissedIds(parsed);
            }, 0);
          } catch (e) {
            console.error("Failed to parse dismissed announcements:", e);
          }
        } else {
          setTimeout(() => {
            setDismissedIds([]);
          }, 0);
        }
      }
    };

    syncDismissed();

    window.addEventListener("notifications-updated", syncDismissed);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("notifications-updated", syncDismissed);
    };
  }, [userId, pathname]);

  const visibleAnnouncements = useMemo(() => {
    return allAnnouncements.filter((a) => !dismissedIds.includes(a.id));
  }, [allAnnouncements, dismissedIds]);

  // Recalculate unread count based on visible non-dismissed announcements + unpaid dues
  const unreadCount = useMemo(() => {
    if (!isMounted || !userId) return 0;
    const lastReadStr = localStorage.getItem(`last_read_announcement_time_${userId}`);
    if (lastReadStr) {
      const lastReadTime = new Date(lastReadStr).getTime();
      const unreadAnn = visibleAnnouncements.filter(
        (a) => new Date(a.date).getTime() > lastReadTime
      ).length;
      return unreadAnn + unpaidFees.length;
    } else {
      return visibleAnnouncements.length + unpaidFees.length;
    }
  }, [isMounted, visibleAnnouncements, userId, unpaidFees]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnnouncements();
    }, 0);

    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchAnnouncements, 30000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchAnnouncements]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b-2 border-border bg-card/80 backdrop-blur-md px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden flex h-9 w-9 items-center justify-center rounded-none border-2 border-border bg-card shadow-[2px_2px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--border)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--border)] transition-all cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Student Profile Banner */}
      {role === "student" && dbProfile?.student && (
        <div className="hidden sm:flex items-center gap-2 text-xs md:text-sm font-black border-2 border-border bg-card px-3 py-1.5 shadow-[2px_2px_0px_0px_var(--border)] select-none">
          <span className="capitalize text-brand-primary">{dbProfile.student.department.toLowerCase()}</span>
          <span className="text-muted-foreground">•</span>
          <span>Semester {formatSemester(dbProfile.student.semester)}</span>
          <span className="text-muted-foreground">•</span>
          <span className="capitalize text-brand-secondary">{dbProfile.student.shift}</span>
        </div>
      )}

      {/* Faculty Profile Banner */}
      {role === "faculty" && dbProfile?.faculty && (
        <div className="hidden sm:flex items-center gap-2 text-xs md:text-sm font-black border-2 border-border bg-card px-3 py-1.5 shadow-[2px_2px_0px_0px_var(--border)] select-none">
          <span className="text-foreground font-black">{dbProfile.name}</span>
          <span className="text-muted-foreground">•</span>
          <span className="capitalize text-brand-primary">Dept. of {dbProfile.faculty.department.toLowerCase()}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-brand-secondary font-bold">{dbProfile.faculty.specialization}</span>
        </div>
      )}

      {/* Admin Profile Banner */}
      {role === "admin" && dbProfile && (
        <div className="hidden sm:flex items-center gap-2 text-xs md:text-sm font-black border-2 border-border bg-card px-3 py-1.5 shadow-[2px_2px_0px_0px_var(--border)] select-none">
          <span className="text-foreground font-black">{dbProfile.name}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-brand-primary font-bold">Administrator</span>
        </div>
      )}

      {/* Right section */}
      <div className="ml-auto flex items-center gap-3">
        {/* Notifications */}
        {!isAdmin && (
          <Link
            href="/dashboard/notifications"
            className="relative h-9 w-9 rounded-none border-2 border-border bg-card flex items-center justify-center shadow-[2px_2px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--border)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--border)] transition-all cursor-pointer focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-none border border-border bg-system-danger text-[9px] font-black text-white shadow-[1px_1px_0px_0px_var(--border)] animate-pulse">
                {unreadCount}
              </span>
            )}
          </Link>
        )}

        {/* User button */}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-9 w-9 ring-2 ring-brand-primary/20",
            },
          }}
        />
      </div>
    </header>
  );
}

