"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Search, Filter, RefreshCw, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

interface AuditLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  adminId: string;
  adminName: string;
  createdAt: string;
}

const actionColors: Record<string, string> = {
  CREATED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  UPDATED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  DELETED: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  APPROVED: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  REJECTED: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  STATUS_CHANGED: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
};

const actionIcons: Record<string, React.ReactNode> = {
  CREATED: <Plus className="h-3 w-3" />,
  UPDATED: <Pencil className="h-3 w-3" />,
  DELETED: <Trash2 className="h-3 w-3" />,
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterEntity !== "all") params.set("entity", filterEntity);
      const url = `/api/audit-log?${params.toString()}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = (await res.json()) as AuditLogEntry[];
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filterEntity]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = logs.filter((log) => {
    if (filterAction !== "all" && log.action !== filterAction) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.description.toLowerCase().includes(q) ||
        log.adminName.toLowerCase().includes(q) ||
        log.entity.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const entities = Array.from(new Set(logs.map((l) => l.entity)));
  const actions = Array.from(new Set(logs.map((l) => l.action)));

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <PageHeader
        title="Audit Trail"
        subtitle={`${logs.length} actions logged — Full transparency for all admin operations`}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Audit Trail" }]}
        action={
          <Button variant="outline" size="sm" onClick={loadLogs}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by description, admin, or entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterEntity} onValueChange={setFilterEntity}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {entities.map((e) => (
              <SelectItem key={e} value={e}>{e}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actions.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Log List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No audit logs found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Admin actions will appear here automatically</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="divide-y divide-border">
              {filteredLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-start gap-4 p-4 hover:bg-accent/30 transition-colors"
                >
                  {/* Action Badge */}
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${actionColors[log.action] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                    {actionIcons[log.action] ?? <Pencil className="h-3 w-3" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-snug">{log.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {log.entity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        by <span className="font-medium text-foreground">{log.adminName}</span>
                      </span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      {new Date(log.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Summary Bar */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {filteredLogs.length} of {logs.length} entries</span>
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          All admin mutations are automatically logged
        </span>
      </div>
    </motion.div>
  );
}
