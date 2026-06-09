"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { CheckCircle, XCircle, Clock, Eye, Trash2, Upload, Users, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { AuditBadgeInline } from "@/components/dashboard/AuditBadge";
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
import { TableSkeleton, Spinner } from "@/components/ui";

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
  shift?: string;
  semester?: number;
  selectedCourses?: string[];
}

interface StaffRequest {
  id: string;
  name: string;
  email: string;
  role: "FACULTY" | "ADMIN";
  phone: string | null;
  department: string | null;
  specialization: string | null;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

const statusColors: Record<"Pending" | "Approved" | "Rejected", string> = {
  Pending:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Approved:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Rejected: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

const statusIcons: Record<"Pending" | "Approved" | "Rejected", LucideIcon> = {
  Pending: Clock,
  Approved: CheckCircle,
  Rejected: XCircle,
};

interface CourseItem {
  id: string;
  courseCode: string;
  courseName: string;
}

export default function ManageAdmissionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"students" | "staff">("students");
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [staffRequests, setStaffRequests] = useState<StaffRequest[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(
    null,
  );
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("Pending");
  const [importing, setImporting] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submittingStatus, setSubmittingStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    api.get<CourseItem[]>("/api/courses")
      .then((r) => setCourses(r.data || []))
      .catch((err) => console.error("Error loading courses in admissions:", err));
  }, []);

  const loadAdmissions = useCallback(() => {
    setLoading(true);
    setError(null);
    const url =
      filterStatus === "all"
        ? "/api/admissions"
        : `/api/admissions?status=${filterStatus}`;
    api
      .get<Admission[]>(url)
      .then((r) => setAdmissions(Array.isArray(r.data) ? r.data : []))
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error ?? "Failed to load admissions");
        setAdmissions([]);
      })
      .finally(() => setLoading(false));
  }, [filterStatus]);

  const loadStaffRequests = useCallback(() => {
    setLoading(true);
    setError(null);
    const url =
      filterStatus === "all"
        ? "/api/onboarding"
        : `/api/onboarding?status=${filterStatus}`;
    api
      .get<StaffRequest[]>(url)
      .then((r) => setStaffRequests(Array.isArray(r.data) ? r.data : []))
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error ?? "Failed to load staff requests");
        setStaffRequests([]);
      })
      .finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => {
    if (activeTab === "students") {
      loadAdmissions();
    } else {
      loadStaffRequests();
    }
  }, [activeTab, loadAdmissions, loadStaffRequests]);

  const handleStatusChange = async (
    id: string,
    newStatus: "Pending" | "Approved" | "Rejected",
  ) => {
    setMutationError(null);
    setSubmittingId(id);
    setSubmittingStatus(newStatus);
    try {
      await api.patch(`/api/admissions/${id}`, { status: newStatus });
      setAdmissions((prev) =>
        filterStatus === "all"
          ? prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
          : prev.filter((a) => a.id !== id)
      );
      if (selectedAdmission?.id === id) {
        setSelectedAdmission({ ...selectedAdmission, status: newStatus });
      }
      if (newStatus === "Approved") {
        setMutationError(null);
        setSuccessMessage(
          "Admission approved — Student record and initial fees auto-created!",
        );
        setTimeout(() => setSuccessMessage(null), 5000);
      }
      router.refresh();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setMutationError(
        axiosErr.response?.data?.error ?? "Failed to update admission status",
      );
    } finally {
      setSubmittingId(null);
      setSubmittingStatus(null);
    }
  };

  const handleStaffStatusChange = async (
    id: string,
    newStatus: "Approved" | "Rejected",
  ) => {
    setMutationError(null);
    setSubmittingId(id);
    setSubmittingStatus(newStatus);
    try {
      await api.patch(`/api/onboarding/approve`, { requestId: id, status: newStatus });
      setStaffRequests((prev) =>
        filterStatus === "all"
          ? prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
          : prev.filter((r) => r.id !== id)
      );
      setSuccessMessage(`Staff request successfully ${newStatus.toLowerCase()}!`);
      setTimeout(() => setSuccessMessage(null), 5000);
      router.refresh();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setMutationError(
        axiosErr.response?.data?.error ?? "Failed to update onboarding request status",
      );
    } finally {
      setSubmittingId(null);
      setSubmittingStatus(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the admission for ${name}?`))
      return;
    setMutationError(null);
    setDeletingId(id);
    try {
      await api.delete(`/api/admissions/${id}`);
      setAdmissions((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setMutationError(
        axiosErr.response?.data?.error ?? "Failed to delete admission",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMutationError(null);
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admissions/import", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "CSV import failed");
      }
      const result = (await res.json()) as { imported: number };
      setSuccessMessage(`Successfully imported ${result.imported} admission(s) from CSV`);
      setTimeout(() => setSuccessMessage(null), 5000);
      loadAdmissions();
      router.refresh();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "CSV import failed");
    } finally {
      setImporting(false);
      if (csvInputRef.current) csvInputRef.current.value = "";
    }
  };

  const columns: Column<Admission>[] = [
    {
      key: "studentName",
      header: "Applicant",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.studentName}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
          <AuditBadgeInline entity="Admission" entityId={row.id} />
        </div>
      ),
    },
    { key: "appliedDepartment", header: "Department", sortable: true },
    {
      key: "applicationDate",
      header: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-muted-foreground">
          {new Date(row.applicationDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const Icon = statusIcons[row.status];
        return (
          <Badge
            variant="secondary"
            className={`flex w-fit items-center gap-1 ${statusColors[row.status]}`}
          >
            <Icon className="h-3 w-3" />
            {row.status}
          </Badge>
        );
      },
    },
    {
      key: "id",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setSelectedAdmission(row);
              setViewDialogOpen(true);
            }}
            disabled={submittingId !== null || deletingId !== null || importing}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="View Details"
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
          </button>
          {row.status === "Pending" && (
            <>
              <button
                onClick={() => handleStatusChange(row.id, "Approved")}
                disabled={submittingId !== null || deletingId !== null || importing}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Approve"
              >
                {submittingId === row.id && submittingStatus === "Approved" ? (
                  <Spinner size="sm" variant="primary" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                )}
              </button>
              <button
                onClick={() => handleStatusChange(row.id, "Rejected")}
                disabled={submittingId !== null || deletingId !== null || importing}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Reject"
              >
                {submittingId === row.id && submittingStatus === "Rejected" ? (
                  <Spinner size="sm" variant="secondary" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-600" />
                )}
              </button>
            </>
          )}
          {row.status !== "Approved" && (
            <button
              onClick={() => handleDelete(row.id, row.studentName)}
              disabled={submittingId !== null || deletingId !== null || importing}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="Delete"
            >
              {deletingId === row.id ? (
                <Spinner size="sm" variant="secondary" />
              ) : (
                <Trash2 className="h-4 w-4 text-rose-500" />
              )}
            </button>
          )}
        </div>
      ),
    },
  ];

  const staffColumns: Column<StaffRequest>[] = [
    {
      key: "name",
      header: "Applicant",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Requested Role",
      sortable: true,
      render: (row) => (
        <Badge
          variant="secondary"
          className={`capitalize gap-1 ${
            row.role === "ADMIN"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          }`}
        >
          {row.role === "ADMIN" ? <Shield className="h-3 w-3" /> : <Users className="h-3 w-3" />}
          {row.role.toLowerCase()}
        </Badge>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (row) => row.phone ?? <span className="text-muted-foreground">—</span>,
    },
    {
      key: "department",
      header: "Department",
      sortable: true,
      render: (row) => row.department ? (
        <Badge variant="outline" className="border-border">
          {row.department}
        </Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
    },
    {
      key: "specialization",
      header: "Specialization / Designation",
      render: (row) => {
        if (!row.specialization) return <span className="text-muted-foreground">—</span>;
        return (
          <div>
            <p className="font-medium text-foreground">{row.specialization}</p>
            <p className="text-[10px] text-muted-foreground">
              {row.role === "ADMIN" ? "Admin Designation" : "Faculty Specialization"}
            </p>
          </div>
        );
      }
    },
    {
      key: "createdAt",
      header: "Applied On",
      sortable: true,
      render: (row) => (
        <span className="text-muted-foreground font-mono text-xs">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => {
        const Icon = statusIcons[row.status];
        return (
          <Badge
            variant="secondary"
            className={`flex w-fit items-center gap-1 ${statusColors[row.status]}`}
          >
            <Icon className="h-3 w-3" />
            {row.status}
          </Badge>
        );
      },
    },
    {
      key: "id",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.status === "Pending" && (
            <>
              <button
                onClick={() => handleStaffStatusChange(row.id, "Approved")}
                disabled={submittingId !== null}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                title="Approve"
              >
                {submittingId === row.id && submittingStatus === "Approved" ? (
                  <Spinner size="sm" variant="primary" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                )}
              </button>
              <button
                onClick={() => handleStaffStatusChange(row.id, "Rejected")}
                disabled={submittingId !== null}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                title="Reject"
              >
                {submittingId === row.id && submittingStatus === "Rejected" ? (
                  <Spinner size="sm" variant="secondary" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-600" />
                )}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <PageHeader
        title="Manage Admissions & Requests"
        subtitle={
          activeTab === "students"
            ? `${admissions.filter((a) => a.status === "Pending").length} pending student admissions require review`
            : `${staffRequests.filter((r) => r.status === "Pending").length} pending staff onboarding requests require review`
        }
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Admissions & Requests" },
        ]}
        action={
          <div className="flex items-center gap-2">
            {activeTab === "students" && (
              <>
                <input
                  type="file"
                  accept=".csv"
                  ref={csvInputRef}
                  onChange={handleCSVImport}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={importing || loading}
                  onClick={() => csvInputRef.current?.click()}
                >
                  {importing ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {importing ? "Importing..." : "Import CSV"}
                </Button>
              </>
            )}
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
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("students")}
          className={`pb-3 px-6 font-bold text-sm border-b-2 transition-all relative ${
            activeTab === "students"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Student Admissions
          {admissions.filter((a) => a.status === "Pending").length > 0 && (
            <span className="ml-2 bg-brand-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {admissions.filter((a) => a.status === "Pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("staff")}
          className={`pb-3 px-6 font-bold text-sm border-b-2 transition-all relative ${
            activeTab === "staff"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Staff Onboarding Requests
          {staffRequests.filter((r) => r.status === "Pending").length > 0 && (
            <span className="ml-2 bg-brand-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {staffRequests.filter((r) => r.status === "Pending").length}
            </span>
          )}
        </button>
      </div>

      {error ? (
        <div className="space-y-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300">
          <p className="text-sm font-medium">
            Failed to load data: {error}
          </p>
          <Button variant="outline" onClick={activeTab === "students" ? loadAdmissions : loadStaffRequests} className="w-fit">
            Retry
          </Button>
        </div>
      ) : loading ? (
        <TableSkeleton rows={10} />
      ) : activeTab === "students" ? (
        <DataTable
          data={admissions as unknown as Record<string, unknown>[]}
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          searchPlaceholder="Search applicants..."
          searchKeys={["studentName", "email", "appliedDepartment"]}
        />
      ) : (
        <DataTable
          data={staffRequests as unknown as Record<string, unknown>[]}
          columns={staffColumns as unknown as Column<Record<string, unknown>>[]}
          searchPlaceholder="Search staff requests..."
          searchKeys={["name", "email", "department", "role"]}
        />
      )}

      {mutationError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300 mt-4">
          {mutationError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300 mt-4 font-semibold">
          ✅ {successMessage}
        </div>
      )}

      {/* Details Dialog (Students only) */}
      <Dialog open={viewDialogOpen} onOpenChange={(open) => { if (submittingId === null) setViewDialogOpen(open); }}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Reviewing admission request for {selectedAdmission?.studentName}
            </DialogDescription>
          </DialogHeader>

          {selectedAdmission && (
            <div className="grid gap-5 py-4 max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Applicant Name
                  </p>
                  <p className="text-sm font-semibold">{selectedAdmission.studentName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Email Address
                  </p>
                  <p className="text-sm font-mono">{selectedAdmission.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Phone Number
                  </p>
                  <p className="text-sm">{selectedAdmission.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Father&apos;s Name
                  </p>
                  <p className="text-sm">{selectedAdmission.fatherName || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    CNIC / B-Form
                  </p>
                  <p className="text-sm font-mono">{selectedAdmission.cnic || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Department
                  </p>
                  <p className="text-sm">{selectedAdmission.appliedDepartment}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Shift & Semester
                  </p>
                  <p className="text-sm">
                    {selectedAdmission.shift || "Morning"} • Semester {selectedAdmission.semester || 1}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Applied On
                  </p>
                  <p className="text-sm font-mono">
                    {new Date(selectedAdmission.applicationDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Previous Institution
                  </p>
                  <p className="text-sm">{selectedAdmission.previousInstitution || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Marks Obtained
                  </p>
                  <p className="text-sm font-semibold">
                    {selectedAdmission.marksObtained} / {selectedAdmission.totalMarks}
                    {selectedAdmission.totalMarks > 0 && (
                      <span className="text-xs font-normal text-muted-foreground ml-1.5">
                        ({((selectedAdmission.marksObtained / selectedAdmission.totalMarks) * 100).toFixed(1)}%)
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-1 col-span-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase">
                    Selected Courses
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {courses.filter(c => selectedAdmission.selectedCourses?.includes(c.id)).length > 0 ? (
                      courses
                        .filter(c => selectedAdmission.selectedCourses?.includes(c.id))
                        .map(c => (
                          <Badge key={c.id} variant="outline" className="bg-violet-50/50 dark:bg-violet-950/10 border-violet-200 dark:border-violet-800">
                            {c.courseCode} - {c.courseName}
                          </Badge>
                        ))
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No courses selected or mapping unavailable</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1 p-3 rounded-lg bg-accent/50 border">
                <p className="text-xs font-medium text-muted-foreground uppercase">
                  Current Status
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={statusColors[selectedAdmission.status]}>
                    {selectedAdmission.status}
                  </Badge>
                  {selectedAdmission.status === "Pending" && (
                    <span className="text-xs text-muted-foreground italic">
                      (Needs review)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:justify-start">
            {selectedAdmission?.status === "Pending" ? (
              <>
                <Button
                  onClick={() =>
                    handleStatusChange(selectedAdmission.id, "Approved")
                  }
                  disabled={submittingId !== null}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 min-w-[120px]"
                >
                  {submittingId === selectedAdmission.id && submittingStatus === "Approved" ? (
                    <Spinner size="sm" variant="white" className="mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
                <Button
                  onClick={() =>
                    handleStatusChange(selectedAdmission.id, "Rejected")
                  }
                  variant="destructive"
                  disabled={submittingId !== null}
                  className="flex-1 min-w-[110px]"
                >
                  {submittingId === selectedAdmission.id && submittingStatus === "Rejected" ? (
                    <Spinner size="sm" variant="white" className="mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                onClick={() => setViewDialogOpen(false)}
                className="w-full"
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
