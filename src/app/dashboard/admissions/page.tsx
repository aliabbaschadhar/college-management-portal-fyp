"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

interface Admission {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  appliedDepartment: string;
  applicationDate: string;
  status: "Pending" | "Approved" | "Rejected";
  fatherName: string | null;
  cnic: string | null;
  previousInstitution: string | null;
  marksObtained: number;
  totalMarks: number;
}

const statusColors: Record<"Pending" | "Approved" | "Rejected", string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Rejected: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const statusIcons: Record<"Pending" | "Approved" | "Rejected", LucideIcon> = {
  Pending: Clock,
  Approved: CheckCircle,
  Rejected: XCircle,
};

export default function ManageAdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const loadAdmissions = useCallback(() => {
    setLoading(true);
    setError(null);
    const url = filterStatus === "all" ? "/api/admissions" : `/api/admissions?status=${filterStatus}`;
    fetch(url)
      .then(async (r) => {
        const payload = (await r.json()) as Admission[] | { error?: string };
        if (!r.ok) {
          const message = !Array.isArray(payload) && payload.error
            ? payload.error
            : "Failed to load admissions";
          throw new Error(message);
        }
        return payload;
      })
      .then((d) => {
        setAdmissions(Array.isArray(d) ? d : []);
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : "Failed to load admissions";
        setError(message);
        setAdmissions([]);
      })
      .finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAdmissions();
  }, [loadAdmissions]);

  const handleStatusChange = async (id: string, newStatus: "Pending" | "Approved" | "Rejected") => {
    setMutationError(null);
    const res = await fetch(`/api/admissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setMutationError(payload?.error ?? "Failed to update admission status");
      return;
    }

    setAdmissions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    if (selectedAdmission?.id === id) {
      setSelectedAdmission({ ...selectedAdmission, status: newStatus });
    }
  };

  const columns: Column<Admission>[] = [
    {
      key: "studentName", header: "Applicant", sortable: true, render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.studentName}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      )
    },
    { key: "appliedDepartment", header: "Department", sortable: true },
    {
      key: "applicationDate", header: "Date", sortable: true, render: (row) => (
        <span className="text-muted-foreground">{new Date(row.applicationDate).toLocaleDateString()}</span>
      )
    },
    {
      key: "status", header: "Status", sortable: true, render: (row) => {
        const Icon = statusIcons[row.status];
        return (
          <Badge variant="secondary" className={`flex w-fit items-center gap-1 ${statusColors[row.status]}`}>
            <Icon className="h-3 w-3" />
            {row.status}
          </Badge>
        );
      }
    },
    {
      key: "id", header: "Actions", render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setSelectedAdmission(row); setViewDialogOpen(true); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
          </button>
          {row.status === "Pending" && (
            <>
              <button
                onClick={() => handleStatusChange(row.id, "Approved")}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                title="Approve"
              >
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </button>
              <button
                onClick={() => handleStatusChange(row.id, "Rejected")}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                title="Reject"
              >
                <XCircle className="h-4 w-4 text-rose-600" />
              </button>
            </>
          )}
        </div>
      )
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300">
        <p className="text-sm font-medium">Failed to load admissions: {error}</p>
        <Button variant="outline" onClick={loadAdmissions} className="w-fit">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <PageHeader
        title="Manage Admissions"
        subtitle={`${admissions.filter((a) => a.status === "Pending").length} pending applications require review`}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Admissions" }]}
        action={
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <DataTable
        data={admissions as unknown as Record<string, unknown>[]}
        columns={columns as unknown as Column<Record<string, unknown>>[]}
        searchPlaceholder="Search applicants..."
        searchKeys={["studentName", "email", "appliedDepartment"]}
      />

      {mutationError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300">
          {mutationError}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>Reviewing admission request for {selectedAdmission?.studentName}</DialogDescription>
          </DialogHeader>

          {selectedAdmission && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Applicant Name</p>
                  <p className="text-sm">{selectedAdmission.studentName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Email Address</p>
                  <p className="text-sm font-mono">{selectedAdmission.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Department</p>
                  <p className="text-sm">{selectedAdmission.appliedDepartment}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Applied On</p>
                  <p className="text-sm font-mono">{new Date(selectedAdmission.applicationDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-1 p-3 rounded-lg bg-accent/50 border">
                <p className="text-xs font-medium text-muted-foreground uppercase">Current Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={statusColors[selectedAdmission.status]}>
                    {selectedAdmission.status}
                  </Badge>
                  {selectedAdmission.status === "Pending" && (
                    <span className="text-xs text-muted-foreground italic">(Needs review)</span>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-start">
            {selectedAdmission?.status === "Pending" ? (
              <>
                <Button
                  onClick={() => handleStatusChange(selectedAdmission.id, "Approved")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Approve
                </Button>
                <Button
                  onClick={() => handleStatusChange(selectedAdmission.id, "Rejected")}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" /> Reject
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setViewDialogOpen(false)} className="w-full">
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
