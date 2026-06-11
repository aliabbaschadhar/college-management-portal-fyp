"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/lib/axios";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Calendar, CreditCard, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/ui";

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
  semester: number;
}

export default function NotificationsPage() {
  const { user } = useUser();
  const userId = user?.id || "anonymous";
  const role = (user?.publicMetadata?.role as string || "student").toLowerCase();
  const isStudent = role === "student";

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unpaidFees, setUnpaidFees] = useState<Fee[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch announcements and fees
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const annRes = await api.get<Announcement[]>("/api/announcements");
        setAnnouncements(Array.isArray(annRes.data) ? annRes.data : []);

        if (isStudent) {
          const feesRes = await api.get<Fee[]>("/api/fees?status=Unpaid");
          setUnpaidFees(Array.isArray(feesRes.data) ? feesRes.data : []);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isStudent]);

  // Load dismissed announcement IDs from localStorage
  useEffect(() => {
    if (userId) {
      const stored = localStorage.getItem(`dismissed_announcements_${userId}`);
      if (stored) {
        try {
          setDismissedIds(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse dismissed announcements:", e);
        }
      }
    }
  }, [userId]);

  // Mark all announcements as read on page load/mount to clear notification badge indicators
  useEffect(() => {
    if (userId) {
      const nowStr = new Date().toISOString();
      localStorage.setItem(`last_read_announcement_time_${userId}`, nowStr);
      window.dispatchEvent(new Event("notifications-updated"));
    }
  }, [userId, announcements]);

  // Filter out dismissed announcements
  const visibleAnnouncements = useMemo(() => {
    return announcements.filter((a) => !dismissedIds.includes(a.id));
  }, [announcements, dismissedIds]);

  // Dismiss individual announcement
  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    if (userId) {
      localStorage.setItem(`dismissed_announcements_${userId}`, JSON.stringify(updated));
      window.dispatchEvent(new Event("notifications-updated"));
    }
  };

  // Dismiss all visible announcements
  const handleDismissAll = () => {
    const allIds = announcements.map((a) => a.id);
    const updated = Array.from(new Set([...dismissedIds, ...allIds]));
    setDismissedIds(updated);
    if (userId) {
      localStorage.setItem(`dismissed_announcements_${userId}`, JSON.stringify(updated));
      window.dispatchEvent(new Event("notifications-updated"));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse border-2 border-border" />
          <div className="h-4 w-72 bg-muted animate-pulse border-2 border-border" />
        </div>
        <ListSkeleton count={5} />
      </div>
    );
  }

  const hasNotifications = unpaidFees.length > 0 || visibleAnnouncements.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Notification Center"
          subtitle="Stay updated with your latest alerts and college announcements."
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Notifications" },
          ]}
        />
        {visibleAnnouncements.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismissAll}
            className="border-2 border-border shadow-[2px_2px_0px_0px_var(--border)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--border)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--border)] transition-all shrink-0 cursor-pointer self-start sm:self-auto"
          >
            Dismiss All Announcements
          </Button>
        )}
      </div>

      {!hasNotifications ? (
        <div className="rounded-xl border-2 border-border bg-card p-12 text-center shadow-[4px_4px_0px_0px_var(--border)]">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 mb-4">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">You&apos;re all caught up!</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            There are no active announcements or pending alerts at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Unpaid Student Dues Alerts (Persistent) */}
          {unpaidFees.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-500 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Urgent Action Required
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unpaidFees.map((fee) => (
                  <div
                    key={fee.id}
                    className="relative rounded-xl border-2 border-rose-500 bg-rose-500/5 p-5 shadow-[4px_4px_0px_0px_#e11d48] dark:shadow-[4px_4px_0px_0px_#f43f5e] flex gap-4 overflow-hidden"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-foreground">
                          Pending Dues: {fee.type}
                        </span>
                        <Badge variant="destructive" className="text-[10px] px-1.5 uppercase font-black tracking-wider">
                          Overdue
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        A pending payment of <strong className="text-rose-600 dark:text-rose-400">PKR {fee.amount.toLocaleString()}</strong> is due for Semester {fee.semester}. Please clear your outstanding balance as soon as possible.
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> Due date: {new Date(fee.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Announcements (Dismissible) */}
          {visibleAnnouncements.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                <Bell className="h-4 w-4 text-brand-primary" /> Active Announcements
              </h3>
              <div className="flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {visibleAnnouncements.map((ann) => (
                    <motion.div
                      key={ann.id}
                      initial={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0, border: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative rounded-xl border-2 border-border bg-card p-5 shadow-[4px_4px_0px_0px_var(--border)] flex gap-4 group overflow-hidden"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-2 pr-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm text-foreground">
                            {ann.title}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-black uppercase tracking-wider ${
                              ann.priority === "High"
                                ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-500/20"
                                : ann.priority === "Medium"
                                ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-500/20"
                                : "bg-blue-50 dark:bg-blue-950/20 text-blue-600 border-blue-500/20"
                            }`}
                          >
                            {ann.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {ann.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground pt-1">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" /> By: {ann.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Posted: {new Date(ann.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDismiss(ann.id)}
                        className="absolute top-4 right-4 p-1 rounded-lg border border-transparent hover:border-border hover:bg-accent transition-all text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none"
                        title="Dismiss announcement"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
