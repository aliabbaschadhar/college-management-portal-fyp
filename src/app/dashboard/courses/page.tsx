"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import {
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  Laptop,
  Calculator,
  Atom,
  BookOpen,
  FlaskConical,
  Coins,
  PenTool,
  Book,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  Loader2
} from "lucide-react";
import { AuditBadgeInline } from "@/components/dashboard/AuditBadge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { DEPARTMENTS } from "@/lib/constants";
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
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { TableSkeleton } from "@/components/ui";

interface CourseWithDetails {
  id: string;
  courseCode: string;
  courseName: string;
  creditHours: number;
  department: string;
  semester: number;
  assignedFaculty: string | null;
  faculty: { user: { name: string | null } } | null;
  _count: { enrollments: number };
}

interface FacultyOption {
  id: string;
  user: { name: string | null };
  department: string;
}

interface CourseForm {
  courseCode: string;
  courseName: string;
  creditHours: number;
  department: string;
  semester: number;
}

const emptyCourse: CourseForm = {
  courseCode: "",
  courseName: "",
  creditHours: 3,
  department: "",
  semester: 1,
};

const departmentMeta: Record<string, { icon: typeof Laptop; color: string; bg: string; border: string }> = {
  "Computer Science": {
    icon: Laptop,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-100 dark:border-blue-900/30"
  },
  "Mathematics": {
    icon: Calculator,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-100 dark:border-purple-900/30"
  },
  "Physics": {
    icon: Atom,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-100 dark:border-emerald-900/30"
  },
  "English": {
    icon: BookOpen,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-100 dark:border-amber-900/30"
  },
  "Chemistry": {
    icon: FlaskConical,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/20",
    border: "border-rose-100 dark:border-rose-900/30"
  },
  "Economics": {
    icon: Coins,
    color: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/20",
    border: "border-cyan-100 dark:border-cyan-900/30"
  },
  "Urdu": {
    icon: PenTool,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-100 dark:border-orange-900/30"
  },
  "Islamic Studies": {
    icon: Book,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/20",
    border: "border-teal-100 dark:border-teal-900/30"
  }
};

const defaultMeta = {
  icon: Book,
  color: "text-zinc-600 dark:text-zinc-400",
  bg: "bg-zinc-50 dark:bg-zinc-950/20",
  border: "border-zinc-100 dark:border-zinc-900/30"
};

export default function ManageCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseWithDetails | null>(
    null,
  );
  const [deletingCourse, setDeletingCourse] =
    useState<CourseWithDetails | null>(null);
  const [assigningCourse, setAssigningCourse] =
    useState<CourseWithDetails | null>(null);
  const [form, setForm] = useState<CourseForm>(emptyCourse);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [assigning, setAssigning] = useState(false);
  const [saving, setSaving] = useState(false);

  // Drill-down states
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedSem, setSelectedSem] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<CourseWithDetails[]>("/api/courses"),
      api.get<FacultyOption[]>("/api/faculty"),
    ])
      .then(([c, f]) => {
        setCourses(Array.isArray(c.data) ? c.data : []);
        setFacultyList(Array.isArray(f.data) ? f.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditingCourse(null);
    setForm({
      courseCode: "",
      courseName: "",
      creditHours: 3,
      department: selectedDept || "",
      semester: selectedSem || 1,
    });
    setDialogOpen(true);
  };

  const openEdit = (c: CourseWithDetails) => {
    setEditingCourse(c);
    setForm({
      courseCode: c.courseCode,
      courseName: c.courseName,
      creditHours: c.creditHours,
      department: c.department,
      semester: c.semester,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.courseCode || !form.courseName || !form.department) return;
    setSaving(true);
    try {
      if (editingCourse) {
        const { data: updated } = await api.patch<CourseWithDetails>(
          `/api/courses/${editingCourse.id}`,
          form,
        );
        setCourses((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c)),
        );
      } else {
        const { data: created } = await api.post<CourseWithDetails>(
          "/api/courses",
          form,
        );
        setCourses((prev) => [created, ...prev]);
      }
      setDialogOpen(false);
      router.refresh();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    setSaving(true);
    try {
      await api.delete(`/api/courses/${deletingCourse.id}`);
      setCourses((prev) => prev.filter((c) => c.id !== deletingCourse.id));
      setDeleteDialogOpen(false);
      setDeletingCourse(null);
      router.refresh();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async () => {
    if (!assigningCourse || !selectedFaculty) return;
    try {
      setAssigning(true);
      const { data: updated } = await api.patch<CourseWithDetails>(
        `/api/courses/${assigningCourse.id}`,
        { assignedFaculty: selectedFaculty },
      );
      setCourses((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
      setAssignDialogOpen(false);
      setSelectedFaculty("");
      router.refresh();
    } catch {
      /* ignore */
    } finally {
      setAssigning(false);
    }
  };

  const columns: Column<CourseWithDetails>[] = [
    {
      key: "courseCode",
      header: "Code",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-semibold text-brand-primary">
          {row.courseCode}
        </span>
      ),
    },
    {
      key: "courseName",
      header: "Course Name",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-foreground">{row.courseName}</span>
          <AuditBadgeInline entity="Course" entityId={row.id} />
        </div>
      ),
    },
    {
      key: "creditHours",
      header: "Credits",
      sortable: true,
      render: (row) => <Badge variant="outline">{row.creditHours} CH</Badge>,
    },
    {
      key: "faculty",
      header: "Faculty",
      render: (row) =>
        row.faculty?.user.name ? (
          <span className="text-sm">{row.faculty.user.name}</span>
        ) : (
          <span className="text-xs text-muted-foreground italic">
            Unassigned
          </span>
        ),
    },
    {
      key: "_count",
      header: "Enrolled",
      sortable: false,
      render: (row) => (
        <span className="font-medium">{row._count.enrollments}</span>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setAssigningCourse(row);
              setSelectedFaculty(row.assignedFaculty || "");
              setAssignDialogOpen(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
            title="Assign Faculty"
          >
            <UserPlus className="h-4 w-4 text-brand-secondary" />
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
              setDeletingCourse(row);
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
  ];

  // Filter courses for DataTable in View 3
  const filteredCourses = courses.filter(
    (c) => c.department === selectedDept && c.semester === selectedSem
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse border-2 border-border" />
            <div className="h-4 w-64 bg-muted animate-pulse border-2 border-border" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse border-2 border-border" />
        </div>
        <TableSkeleton rows={8} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <AnimatePresence mode="wait">
        {/* VIEW 1: DEPARTMENT SELECTOR */}
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
              title="Manage Courses"
              subtitle="Select a department to manage semesters and subjects."
              breadcrumbs={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Manage Courses" },
              ]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {DEPARTMENTS.map((dept) => {
                const meta = departmentMeta[dept] || defaultMeta;
                const Icon = meta.icon;
                const deptCount = courses.filter((c) => c.department === dept).length;

                return (
                  <Card
                    key={dept}
                    onClick={() => setSelectedDept(dept)}
                    className="group border border-border bg-card hover:bg-accent/40 dark:hover:bg-accent/10 hover:border-brand-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden rounded-xl"
                  >
                    <CardContent className="p-6 flex flex-col gap-4 relative">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${meta.bg} ${meta.border} ${meta.color} transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-foreground group-hover:text-brand-primary transition-colors line-clamp-1">
                          {dept}
                        </h3>
                        <p className="text-xs text-muted-foreground font-medium">
                          {deptCount} Subject{deptCount !== 1 ? "s" : ""} Offered
                        </p>
                      </div>

                      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                        <ChevronRight className="h-5 w-5 text-brand-primary" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* VIEW 2: SEMESTER SELECTOR */}
        {selectedDept !== null && selectedSem === null && (
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
              subtitle="Select a semester to manage its subjects."
              breadcrumbs={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Manage Courses", onClick: () => setSelectedDept(null), href: "#" },
                { label: selectedDept },
              ]}
              action={
                <Button
                  variant="outline"
                  onClick={() => setSelectedDept(null)}
                  className="gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Departments
                </Button>
              }
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                const semCount = courses.filter(
                  (c) => c.department === selectedDept && c.semester === sem
                ).length;

                return (
                  <Card
                    key={sem}
                    onClick={() => setSelectedSem(sem)}
                    className="group border border-border bg-card hover:bg-accent/40 dark:hover:bg-accent/10 hover:border-brand-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden rounded-xl"
                  >
                    <CardContent className="p-6 flex flex-col gap-3 relative">
                      <div className="h-10 w-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary transition-transform duration-300 group-hover:scale-110">
                        <GraduationCap className="h-5.5 w-5.5" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-foreground group-hover:text-brand-primary transition-colors">
                          Semester {sem}
                        </h4>
                        <p className="text-xs text-muted-foreground font-medium">
                          {semCount} Course{semCount !== 1 ? "s" : ""}
                        </p>
                      </div>

                      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                        <ChevronRight className="h-4 w-4 text-brand-primary" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* VIEW 3: COURSES LIST & TABLE */}
        {selectedDept !== null && selectedSem !== null && (
          <motion.div
            key="courses-table"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <PageHeader
              title={`Semester ${selectedSem} Courses`}
              subtitle={`Offered subjects in ${selectedDept}.`}
              breadcrumbs={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Manage Courses", onClick: () => { setSelectedDept(null); setSelectedSem(null); }, href: "#" },
                { label: selectedDept, onClick: () => setSelectedSem(null), href: "#" },
                { label: `Semester ${selectedSem}` },
              ]}
              action={
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSem(null)}
                    className="gap-2 border-border hover:bg-accent hover:text-accent-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back to Semesters
                  </Button>
                  <Button
                    onClick={openAdd}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Subject
                  </Button>
                </div>
              }
            />

            <DataTable
              data={filteredCourses as unknown as Record<string, unknown>[]}
              columns={columns as unknown as Column<Record<string, unknown>>[]}
              searchPlaceholder="Search by code or name..."
              searchKeys={["courseCode", "courseName"]}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "Edit Subject" : "Add New Subject"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse
                ? "Update subject details."
                : `Add a subject to Semester ${form.semester} in ${form.department}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseCode">Subject Code</Label>
                <Input
                  id="courseCode"
                  value={form.courseCode}
                  onChange={(e) =>
                    setForm({ ...form, courseCode: e.target.value })
                  }
                  placeholder="CS-301"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseName">Subject Name</Label>
                <Input
                  id="courseName"
                  value={form.courseName}
                  onChange={(e) =>
                    setForm({ ...form, courseName: e.target.value })
                  }
                  placeholder="Database Systems"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="creditHours">Credit Hours</Label>
                <Select
                  value={String(form.creditHours)}
                  onValueChange={(v) =>
                    setForm({ ...form, creditHours: Number(v) })
                  }
                >
                  <SelectTrigger id="creditHours">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((c) => (
                      <SelectItem key={c} value={String(c)}>
                        {c} CH
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept">Department</Label>
                <Select
                  value={form.department}
                  onValueChange={(v) => setForm({ ...form, department: v })}
                  disabled={!editingCourse && selectedDept !== null}
                >
                  <SelectTrigger id="dept">
                    <SelectValue placeholder="Select" />
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
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={String(form.semester)}
                  onValueChange={(v) =>
                    setForm({ ...form, semester: Number(v) })
                  }
                  disabled={!editingCourse && selectedSem !== null}
                >
                  <SelectTrigger id="semester">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        Sem {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={saving} onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white min-w-[120px]"
            >
              {saving ? "Saving..." : editingCourse ? "Update" : "Add Subject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Faculty Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Assign Faculty</DialogTitle>
            <DialogDescription>
              Assign a faculty member to{" "}
              <strong>{assigningCourse?.courseName}</strong> (
              {assigningCourse?.courseCode})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty} disabled={assigning}>
              <SelectTrigger>
                <SelectValue placeholder="Select faculty member" />
              </SelectTrigger>
              <SelectContent>
                {facultyList.filter((f) => f.department === assigningCourse?.department).length === 0 ? (
                  <SelectItem value="none" disabled>
                    No faculty available in {assigningCourse?.department}
                  </SelectItem>
                ) : (
                  facultyList
                    .filter((f) => f.department === assigningCourse?.department)
                    .map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.user.name ?? "—"}
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={assigning || !selectedFaculty || selectedFaculty === "none"}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white min-w-20"
            >
              {assigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingCourse?.courseName}</strong>? This will remove it from all student enrollments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" disabled={saving} onClick={handleDelete} className="min-w-[100px]">
              {saving ? "Deleting..." : <><Trash2 className="h-4 w-4 mr-2" /> Delete</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
