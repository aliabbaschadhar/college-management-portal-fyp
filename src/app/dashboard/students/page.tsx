"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/axios";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Loader2, Eye, Calendar, Mail, Phone, Clock } from "lucide-react";
import { AuditBadgeInline } from "@/components/dashboard/AuditBadge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { DEPARTMENTS } from "@/lib/constants";
import type { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { TableSkeleton, Spinner } from "@/components/ui";

interface StudentWithUser {
  id: string;
  userId: string;
  rollNo: string;
  phone: string | null;
  department: string;
  semester: number;
  enrollmentDate: string;
  avatar: string | null;
  shift: string;
  user: { name: string | null; email: string };
  _count: { enrollments: number };
}

const deptColors: Record<string, string> = {
  "Computer Science":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Mathematics:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Physics:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  English:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Chemistry: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  Economics: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  Urdu: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "Islamic Studies":
    "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

interface EditForm {
  rollNo: string;
  phone: string;
  department: string;
  semester: number;
  shift: string;
}

const departmentIcons: Record<string, string> = {
  "Computer Science": "💻",
  Mathematics: "📐",
  Physics: "⚛️",
  English: "📚",
  Chemistry: "🧪",
  Economics: "📊",
  Urdu: "✍️",
  "Islamic Studies": "🕌",
};

const emptyForm: EditForm = {
  rollNo: "",
  phone: "",
  department: "",
  semester: 1,
  shift: "Morning",
};

export default function ManageStudentsPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  const role = useMemo<UserRole>(() => {
    const rawRole = user?.publicMetadata?.role;
    if (rawRole === "admin" || rawRole === "faculty" || rawRole === "student") {
      return rawRole;
    }
    return "student";
  }, [user?.publicMetadata?.role]);

  const isAdmin = role === "admin";

  const [students, setStudents] = useState<StudentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithUser | null>(
    null
  );
  const [deletingStudent, setDeletingStudent] =
    useState<StudentWithUser | null>(null);
  const [form, setForm] = useState<EditForm>(emptyForm);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedShift, setSelectedShift] = useState<string>("Morning");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Detail Dialog states
  const [detailStudent, setDetailStudent] = useState<StudentWithUser | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Bulk/Class promotion states
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [targetSemester, setTargetSemester] = useState("1");
  const [isPromotingAllClass, setIsPromotingAllClass] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!selectedDept || !selectedSemester) return [];
    return students.filter(
      (s) =>
        s.department === selectedDept &&
        s.semester === selectedSemester &&
        s.shift === selectedShift
    );
  }, [students, selectedDept, selectedSemester, selectedShift]);

  useEffect(() => {
    setSelectedStudentIds([]);
  }, [selectedDept, selectedSemester]);

  useEffect(() => {
    if (selectedSemester) {
      setTargetSemester(String(Math.min(8, selectedSemester + 1)));
    }
  }, [selectedSemester]);

  const selectedStudents = useMemo(() => {
    return students.filter((s) => selectedStudentIds.includes(s.id));
  }, [students, selectedStudentIds]);

  const canPromoteCount = useMemo(() => {
    if (isPromotingAllClass) {
      return filteredStudents.filter((s) => s.semester < 8).length;
    }
    return selectedStudents.filter((s) => s.semester < 8).length;
  }, [selectedStudents, filteredStudents, isPromotingAllClass]);

  const cannotPromoteCount = useMemo(() => {
    if (isPromotingAllClass) {
      return filteredStudents.filter((s) => s.semester >= 8).length;
    }
    return selectedStudents.filter((s) => s.semester >= 8).length;
  }, [selectedStudents, filteredStudents, isPromotingAllClass]);

  const handlePromote = async () => {
    setPromoting(true);
    try {
      let payload: Record<string, unknown> = {
        targetSemester: Number(targetSemester),
      };

      if (isPromotingAllClass) {
        payload = {
          ...payload,
          department: selectedDept,
          semester: selectedSemester,
        };
      } else {
        const promoteIds = selectedStudents.filter((s) => s.semester < 8).map((s) => s.id);
        if (promoteIds.length === 0) return;
        payload = {
          ...payload,
          studentIds: promoteIds,
        };
      }

      const { data } = await api.post<{ promotedStudents: { id: string; semester: number }[] }>(
        "/api/students/promote",
        payload
      );

      // Update local student semesters
      const promotedMap = new Map(data.promotedStudents.map((s) => [s.id, s.semester]));
      setStudents((prev) =>
        prev.map((s) => {
          const newSem = promotedMap.get(s.id);
          if (newSem !== undefined) {
            return { ...s, semester: newSem };
          }
          return s;
        })
      );

      setSelectedStudentIds([]);
      setPromotionDialogOpen(false);
      alert(`Successfully promoted ${data.promotedStudents.length} student(s) to Semester ${targetSemester}!`);
      router.refresh();
    } catch (err: unknown) {
      console.error("Promotion failed:", err);
      const axiosErr = err as { response?: { data?: { error?: string } } };
      alert(`Failed to promote students: ${axiosErr.response?.data?.error ?? "Unknown error"}`);
    } finally {
      setPromoting(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (role === "student") {
      router.replace("/dashboard");
      return;
    }
    setLoading(true);
    api
      .get<unknown[]>("/api/students")
      .then((r) => {
        const d = r.data;
        const normalized = Array.isArray(d)
          ? d.map((item: unknown) => {
              const s = item as Record<string, unknown>;
              return {
                ...s,
                user: {
                  name:
                    s.user && typeof s.user === "object" && "name" in s.user
                      ? s.user.name
                      : (s.name ?? null),
                  email:
                    s.user && typeof s.user === "object" && "email" in s.user
                      ? s.user.email
                      : (s.email ?? ""),
                },
                _count: s._count ?? { enrollments: 0 },
              };
            })
          : [];
        setStudents(normalized as StudentWithUser[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isLoaded, role, router]);

  const openEdit = (s: StudentWithUser) => {
    setEditingStudent(s);
    setForm({
      rollNo: s.rollNo,
      phone: s.phone ?? "",
      department: s.department,
      semester: s.semester,
      shift: s.shift || "Morning",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingStudent || !form.rollNo || !form.department) return;
    setSubmitting(true);
    try {
      const { data: updated } = await api.patch<Record<string, unknown>>(
        `/api/students/${editingStudent.id}`,
        form
      );
      const normalized: StudentWithUser = {
        ...(updated as unknown as StudentWithUser),
        user: {
          name:
            ((updated.user as Record<string, unknown>)?.name as string) ??
            (updated.name as string) ??
            null,
          email:
            ((updated.user as Record<string, unknown>)?.email as string) ??
            (updated.email as string) ??
            "",
        },
        _count: (updated._count as { enrollments: number }) ?? {
          enrollments: 0,
        },
      };
      setStudents((prev) =>
        prev.map((s) => (s.id === normalized.id ? normalized : s))
      );
      setDialogOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      alert(
        `Failed to update student: ${axiosErr.response?.data?.error ?? "Unknown error"}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStudent) return;
    setDeleting(true);
    try {
      await api.delete(`/api/students/${deletingStudent.id}`);
      setStudents((prev) => prev.filter((s) => s.id !== deletingStudent.id));
      setDeleteDialogOpen(false);
      setDeletingStudent(null);
      router.refresh();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      alert(
        `Failed to delete student: ${axiosErr.response?.data?.error ?? "Unknown error"}`
      );
      setDeleteDialogOpen(false);
      setDeletingStudent(null);
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<StudentWithUser>[] = [
    ...(isAdmin
      ? [
          {
            key: "selection",
            header: (
              <input
                type="checkbox"
                checked={
                  filteredStudents.length > 0 &&
                  filteredStudents.every((s) => selectedStudentIds.includes(s.id))
                }
                onChange={(e) => {
                  const checked = e.target.checked;
                  if (checked) {
                    const idsToAdd = filteredStudents.map((s) => s.id);
                    setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...idsToAdd])));
                  } else {
                    const idsToRemove = new Set(filteredStudents.map((s) => s.id));
                    setSelectedStudentIds((prev) => prev.filter((id) => !idsToRemove.has(id)));
                  }
                }}
                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#16122d] text-brand-primary focus:ring-brand-primary"
              />
            ),
            render: (row: StudentWithUser) => (
              <input
                type="checkbox"
                checked={selectedStudentIds.includes(row.id)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSelectedStudentIds((prev) =>
                    checked ? [...prev, row.id] : prev.filter((id) => id !== row.id)
                  );
                }}
                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#16122d] text-brand-primary focus:ring-brand-primary"
              />
            ),
          },
        ]
      : []),
    {
      key: "user",
      header: "Name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-bold text-brand-primary shrink-0">
            {(row.user.name ?? "?")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {row.user.name ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">{row.user.email}</p>
            <AuditBadgeInline entity="Student" entityId={row.id} />
          </div>
        </div>
      ),
    },
    { key: "rollNo", header: "Roll No", sortable: true },
    {
      key: "department",
      header: "Department",
      sortable: true,
      render: (row) => (
        <Badge variant="secondary" className={deptColors[row.department] || ""}>
          {row.department}
        </Badge>
      ),
    },
    {
      key: "semester",
      header: "Semester",
      sortable: true,
      render: (row) => <span className="font-medium">{row.semester}</span>,
    },
    {
      key: "shift",
      header: "Shift",
      sortable: true,
      render: (row) => (
        <Badge
          variant="outline"
          className={
            row.shift === "Morning"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
              : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
          }
        >
          {row.shift}
        </Badge>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: "actions" as keyof StudentWithUser,
            header: "Actions",
            render: (row: StudentWithUser) => (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setDetailStudent(row);
                    setDetailDialogOpen(true);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
                  title="View Details"
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => openEdit(row)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => {
                    setDeletingStudent(row);
                    setDeleteDialogOpen(true);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-destructive/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </div>
            ),
          },
        ]
      : [
          {
            key: "actions" as keyof StudentWithUser,
            header: "Actions",
            render: (row: StudentWithUser) => (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setDetailStudent(row);
                    setDetailDialogOpen(true);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
                  title="View Details"
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ),
          },
        ]),
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0e0c18] flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-brand-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <AnimatePresence mode="wait">
        {selectedDept === null && (
          <motion.div
            key="departments"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <PageHeader
              title="Manage Students"
              subtitle={`${students.length} students enrolled across all departments`}
              breadcrumbs={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Manage Students" },
              ]}
            />

            {loading ? (
              <TableSkeleton rows={10} />
            ) : (
              /* Department Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {DEPARTMENTS.map((dept) => {
                  const count = students.filter((s) => s.department === dept).length;
                  return (
                    <motion.div
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      key={dept}
                      onClick={() => setSelectedDept(dept)}
                      className="cursor-pointer p-6 bg-card border-2 border-border rounded-2xl shadow-sm hover:shadow-md hover:border-brand-primary transition-all duration-200 flex flex-col justify-between h-40 group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-bl-full flex items-center justify-center text-4xl opacity-50 group-hover:scale-110 transition-transform duration-300">
                        {departmentIcons[dept] || "🎓"}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-brand-primary transition-colors">
                          {dept}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">Department</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm font-semibold bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full">
                          {count} {count === 1 ? "Student" : "Students"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {selectedDept !== null && selectedSemester === null && (
          <motion.div
            key="semesters"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <PageHeader
              title={selectedDept}
              subtitle="Select a semester to view the class list"
              breadcrumbs={[
                { label: "Dashboard", href: "/dashboard" },
                {
                  label: "Manage Students",
                  onClick: () => {
                    setSelectedDept(null);
                    setSelectedSemester(null);
                  },
                },
                { label: selectedDept },
              ]}
            />

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDept(null)}
                  className="rounded-xl border-2"
                >
                  ← Back to Departments
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                  const count = students.filter(
                    (s) => s.department === selectedDept && s.semester === sem
                  ).length;
                  return (
                    <motion.div
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      key={sem}
                      onClick={() => setSelectedSemester(sem)}
                      className="cursor-pointer p-6 bg-card border-2 border-border rounded-2xl shadow-sm hover:shadow-md hover:border-brand-primary transition-all duration-200 flex flex-col justify-between h-36 group relative overflow-hidden"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Semester {sem}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Active Class</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs font-semibold bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-full">
                          {count} {count === 1 ? "Student" : "Students"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {selectedDept !== null && selectedSemester !== null && (
          <motion.div
            key="students-table-view"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <PageHeader
              title={`${selectedDept} - Semester ${selectedSemester}`}
              subtitle={`${filteredStudents.length} students enrolled in this class`}
              breadcrumbs={[
                { label: "Dashboard", href: "/dashboard" },
                {
                  label: "Manage Students",
                  onClick: () => {
                    setSelectedDept(null);
                    setSelectedSemester(null);
                  },
                },
                {
                  label: selectedDept,
                  onClick: () => {
                    setSelectedSemester(null);
                  },
                },
                { label: `Semester ${selectedSemester}` },
              ]}
            />

            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSemester(null)}
                    className="rounded-xl border-2"
                  >
                    ← Back to Semesters
                  </Button>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-muted-foreground uppercase">Shift:</span>
                    <Select value={selectedShift} onValueChange={setSelectedShift}>
                      <SelectTrigger className="w-[150px] h-10 border-2 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setIsPromotingAllClass(true);
                        setPromotionDialogOpen(true);
                      }}
                      variant="outline"
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-600/10 rounded-xl flex items-center gap-2"
                    >
                      Promote Entire Class
                    </Button>
                    {selectedStudentIds.length > 0 && (
                      <Button
                        onClick={() => {
                          setIsPromotingAllClass(false);
                          setPromotionDialogOpen(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      >
                        Promote Selected ({selectedStudentIds.length})
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-card/50 backdrop-blur-sm border rounded-xl overflow-hidden shadow-sm">
                <DataTable
                  data={filteredStudents as unknown as Record<string, unknown>[]}
                  columns={columns as unknown as Column<Record<string, unknown>>[]}
                  searchPlaceholder="Search by roll no..."
                  searchKeys={["rollNo"]}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail View Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[450px] overflow-hidden rounded-3xl p-0 border-none bg-linear-to-b from-card to-background shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Student Profile Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected student profile.
            </DialogDescription>
          </DialogHeader>
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-brand-primary via-brand-secondary to-brand-primary" />
          <div className="p-6 pt-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 rounded-full bg-brand-primary/20 blur-md transition-all group-hover:bg-brand-primary/30" />
                {detailStudent?.avatar ? (
                  <img
                    src={detailStudent.avatar}
                    alt="Avatar"
                    className="relative z-10 h-24 w-24 rounded-full border-2 border-border object-cover shadow-md"
                  />
                ) : (
                  <div className="relative z-10 h-24 w-24 rounded-full border-2 border-border bg-brand-primary/10 flex items-center justify-center text-3xl font-bold text-brand-primary shadow-md">
                    {(detailStudent?.user.name ?? "?")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-foreground">{detailStudent?.user.name ?? "—"}</h2>
              <p className="text-sm font-semibold text-muted-foreground font-mono">{detailStudent?.rollNo}</p>
              <div className="flex justify-center gap-2 pt-1.5">
                <Badge variant="secondary" className={deptColors[detailStudent?.department ?? ""] || ""}>
                  {detailStudent?.department}
                </Badge>
                <Badge variant="outline" className="font-bold border-brand-primary/20 text-brand-primary bg-brand-primary/5">
                  Semester {detailStudent?.semester}
                </Badge>
              </div>
            </div>

            <div className="border-t border-border/60 my-6 pt-4 text-left space-y-3 px-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-xs text-muted-foreground block">Email Address</span>
                  <span className="font-semibold text-foreground">{detailStudent?.user.email ?? "—"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-xs text-muted-foreground block">Phone Number</span>
                  <span className="font-semibold text-foreground">{detailStudent?.phone ?? "—"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-xs text-muted-foreground block">Shift</span>
                  <span className="font-semibold text-foreground">{detailStudent?.shift ?? "—"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
                <div>
                  <span className="text-xs text-muted-foreground block">Enrollment Date &amp; Time</span>
                  <span className="font-semibold text-foreground">
                    {detailStudent?.enrollmentDate
                      ? new Date(detailStudent.enrollmentDate).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button variant="outline" className="rounded-xl min-w-[120px]" onClick={() => setDetailDialogOpen(false)}>
                Close Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {isAdmin && (
        <>
          {/* Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Student</DialogTitle>
                <DialogDescription>
                  Update the student information below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rollNo">Roll Number</Label>
                    <Input
                      id="rollNo"
                      value={form.rollNo}
                      onChange={(e) =>
                        setForm({ ...form, rollNo: e.target.value })
                      }
                      placeholder="CS-2022-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="0300-1234567"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={form.department}
                      onValueChange={(v) => setForm({ ...form, department: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select
                      value={String(form.semester)}
                      onValueChange={(v) =>
                        setForm({ ...form, semester: Number(v) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                          <SelectItem key={s} value={String(s)}>
                            Semester {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Shift</Label>
                    <Select
                      value={form.shift}
                      onValueChange={(v) => setForm({ ...form, shift: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-[#110d22] border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white">
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" disabled={submitting} onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={submitting}
                  className="bg-brand-primary hover:bg-brand-primary/90 text-white min-w-[140px]"
                >
                  {submitting && <Spinner size="sm" variant="white" className="mr-2" />}
                  {submitting ? "Saving..." : "Update Student"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Delete Student</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete{" "}
                  <strong>{deletingStudent?.user.name}</strong> (
                  {deletingStudent?.rollNo})? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  disabled={deleting}
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" disabled={deleting} onClick={handleDelete} className="min-w-[100px]">
                  {deleting ? (
                    <Spinner size="sm" variant="white" className="mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Promotion Confirmation Dialog */}
          <Dialog open={promotionDialogOpen} onOpenChange={setPromotionDialogOpen}>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Promote Students</DialogTitle>
                <DialogDescription>
                  {isPromotingAllClass
                    ? `You are about to promote the entire class in ${selectedDept} Semester ${selectedSemester}.`
                    : "You are about to promote selected students."}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label>Target Semester</Label>
                  <Select value={targetSemester} onValueChange={setTargetSemester}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select target semester" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#110d22] border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <SelectItem key={sem} value={String(sem)}>
                          Semester {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    This action will:
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground pl-2">
                    <li>Update their semesters to <strong>Semester {targetSemester}</strong></li>
                    <li>Automatically enroll them in all courses offered in the target semester</li>
                  </ul>
                </div>

                <div className="p-3 bg-accent/30 rounded-xl space-y-2 border">
                  <div className="flex justify-between text-sm">
                    <span>Target Students Count:</span>
                    <span className="font-semibold">{isPromotingAllClass ? filteredStudents.length : selectedStudentIds.length}</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                    <span>Eligible for Promotion:</span>
                    <span className="font-semibold">{canPromoteCount}</span>
                  </div>
                  {cannotPromoteCount > 0 && (
                    <div className="flex justify-between text-sm text-destructive">
                      <span>Already in Target / Final Sem (Skipped):</span>
                      <span className="font-semibold">{cannotPromoteCount}</span>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  disabled={promoting}
                  onClick={() => setPromotionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePromote}
                  disabled={promoting || canPromoteCount === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
                >
                  {promoting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {promoting ? "Promoting..." : `Promote (${canPromoteCount})`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </motion.div>
  );
}
