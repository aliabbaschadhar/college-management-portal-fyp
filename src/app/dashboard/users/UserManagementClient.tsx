"use client";

import { useState, useEffect, useCallback } from "react";
import { Users2, Search, Shield, ChevronRight, Check, X, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { AuditBadgeInline } from "@/components/dashboard/AuditBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

type Role = "ADMIN" | "FACULTY" | "STUDENT";

interface UserRow {
  id: string;
  clerkId: string | null;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
  student: { rollNo: string; department: string } | null;
  faculty: { department: string } | null;
}

const roleBadgeClass: Record<Role, string> = {
  ADMIN: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  FACULTY: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  STUDENT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

function AvatarCircle({ name, role }: { name: string | null; role: Role }) {
  const initials = (name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const bg =
    role === "ADMIN"
      ? "bg-blue-500"
      : role === "FACULTY"
      ? "bg-emerald-500"
      : "bg-brand-primary";
  return (
    <div
      className={`h-9 w-9 shrink-0 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold`}
    >
      {initials}
    </div>
  );
}

export function UserManagementClient() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"ALL" | Role>("ALL");
  const [pendingChange, setPendingChange] = useState<{ user: UserRow; newRole: Role } | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, Role>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterRole !== "ALL") params.set("role", filterRole);
      if (search) params.set("search", search);
      const res = await fetch(`/api/users?${params.toString()}`);
      if (res.ok) {
        const data = (await res.json()) as UserRow[];
        setUsers(data);
        // Seed role selects with current values
        const initial: Record<string, Role> = {};
        data.forEach((u) => { initial[u.id] = u.role; });
        setSelectedRoles(initial);
      }
    } finally {
      setLoading(false);
    }
  }, [filterRole, search]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleConfirmChange = async () => {
    if (!pendingChange) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${pendingChange.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: pendingChange.newRole }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === pendingChange.user.id ? { ...u, role: pendingChange.newRole } : u
          )
        );
        showToast(`${pendingChange.user.name ?? pendingChange.user.email} is now ${pendingChange.newRole}`);
      } else {
        const err = (await res.json()) as { error?: string };
        showToast(err.error ?? "Failed to update role", false);
      }
    } catch {
      showToast("Network error — please try again", false);
    } finally {
      setSaving(false);
      setPendingChange(null);
    }
  };

  const adminCount = users.filter((u) => u.role === "ADMIN").length;
  const facultyCount = users.filter((u) => u.role === "FACULTY").length;
  const studentCount = users.filter((u) => u.role === "STUDENT").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <PageHeader
        title="User Management"
        subtitle="View all portal users and manage their role assignments"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "User Management" },
        ]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Users"
          value={users.length}
          trend="Registered accounts"
          trendDirection="up"
          icon={Users2}
          iconColor="#6366f1"
          iconBg="#6366f120"
        />
        <StatsCard
          title="Faculty"
          value={facultyCount}
          trend="Teaching staff"
          trendDirection="up"
          icon={Shield}
          iconColor="#10b981"
          iconBg="#10b98120"
        />
        <StatsCard
          title="Students"
          value={studentCount}
          trend="Enrolled learners"
          trendDirection="up"
          icon={Users2}
          iconColor="#f59e0b"
          iconBg="#f59e0b20"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="user-search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
        </div>
        <Select
          value={filterRole}
          onValueChange={(v) => setFilterRole(v as "ALL" | Role)}
        >
          <SelectTrigger id="role-filter" className="w-full sm:w-48 h-10 rounded-xl">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="FACULTY">Faculty</SelectItem>
            <SelectItem value="STUDENT">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left py-3 px-4 font-semibold text-foreground">User</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">Role</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground hidden md:table-cell">ID</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground hidden lg:table-cell">Joined</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground hidden xl:table-cell">Audit</th>
                <th className="text-center py-3 px-4 font-semibold text-foreground">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="py-3 px-4">
                        <div className="h-4 rounded-md bg-muted/60 animate-pulse w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground">
                    <Users2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No users found</p>
                    <p className="text-xs mt-1">Try adjusting your search or role filter</p>
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.25 }}
                    className="border-b border-border/50 hover:bg-accent/20 transition-colors"
                  >
                    {/* User */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <AvatarCircle name={user.name} role={user.role} />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {user.name ?? "—"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="text-center py-3 px-3">
                      <Badge variant="secondary" className={roleBadgeClass[user.role]}>
                        {user.role}
                      </Badge>
                    </td>

                    {/* Identifier */}
                    <td className="text-center py-3 px-3 text-xs text-muted-foreground font-mono hidden md:table-cell">
                      {user.student?.rollNo ?? "—"}
                    </td>

                    {/* Joined */}
                    <td className="text-center py-3 px-3 text-xs text-muted-foreground hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    {/* Audit */}
                    <td className="text-center py-3 px-3 hidden xl:table-cell">
                      <AuditBadgeInline entity="User" entityId={user.id} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 justify-center">
                        <Select
                          value={selectedRoles[user.id] ?? user.role}
                          onValueChange={(v) =>
                            setSelectedRoles((prev) => ({ ...prev, [user.id]: v as Role }))
                          }
                        >
                          <SelectTrigger
                            id={`role-select-${user.id}`}
                            className="h-8 w-32 rounded-lg text-xs"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="FACULTY">Faculty</SelectItem>
                            <SelectItem value="STUDENT">Student</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 rounded-lg gap-1 text-xs"
                          disabled={selectedRoles[user.id] === user.role}
                          onClick={() =>
                            setPendingChange({
                              user,
                              newRole: selectedRoles[user.id] ?? user.role,
                            })
                          }
                        >
                          Apply <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!pendingChange} onOpenChange={() => setPendingChange(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-brand-primary" />
              Confirm Role Change
            </DialogTitle>
          </DialogHeader>

          {pendingChange && (
            <div className="space-y-4 py-2">
              {/* User preview */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                <AvatarCircle name={pendingChange.user.name} role={pendingChange.user.role} />
                <div>
                  <p className="font-semibold text-foreground">
                    {pendingChange.user.name ?? pendingChange.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">{pendingChange.user.email}</p>
                </div>
              </div>

              {/* Role transition */}
              <div className="flex items-center gap-3 justify-center">
                <Badge variant="secondary" className={roleBadgeClass[pendingChange.user.role]}>
                  {pendingChange.user.role}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary" className={roleBadgeClass[pendingChange.newRole]}>
                  {pendingChange.newRole}
                </Badge>
              </div>

              {/* ADMIN promotion warning */}
              {pendingChange.newRole === "ADMIN" && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Granting Admin access gives full control over the portal including user
                    management, grades, and financial data.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setPendingChange(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmChange}
              disabled={saving}
              className="bg-brand-primary text-white hover:opacity-90 rounded-xl gap-2"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin border-2 border-white/40 border-t-white rounded-full" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" /> Confirm Change
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl text-sm font-medium ${
              toast.ok
                ? "bg-emerald-600 text-white"
                : "bg-destructive text-destructive-foreground"
            }`}
          >
            {toast.ok ? (
              <Check className="h-4 w-4 shrink-0" />
            ) : (
              <X className="h-4 w-4 shrink-0" />
            )}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
