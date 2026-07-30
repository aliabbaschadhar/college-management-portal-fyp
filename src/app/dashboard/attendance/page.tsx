"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/axios";
import { ClipboardCheck, Filter, Eye, Loader2, Calendar, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableSkeleton } from "@/components/ui";
import { useUser } from "@clerk/nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { DEPARTMENTS } from "@/lib/constants";

interface AttendanceWithDetails {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: "Present" | "Absent" | "Late";
  markedBy: string;
  student: {
    id: string;
    rollNo: string;
    department: string;
    semester: number;
    shift: string;
    user: { name: string | null };
  };
  course: { courseCode: string; courseName?: string };
}

interface StudentItem {
  id: string;
  userId: string;
  rollNo: string;
  phone: string | null;
  department: string;
  semester: number;
  shift: string;
  blocked: boolean;
  readmitRequested?: boolean;
  enrollments?: { id: string; courseId: string; blocked: boolean; readmitRequested: boolean }[];
  enrollmentDate: string;
  avatar: string | null;
  user: { name: string | null; email: string };
  _count?: { enrollments: number };
}

interface StudentStatsItem extends StudentItem {
  stats: {
    total: number;
    present: number;
    absent: number;
    late: number;
    rate: number;
  };
}

interface CourseType {
  id: string;
  department: string;
  semester: number;
  courseCode: string;
  courseName: string;
}

const statusColors: Record<"Present" | "Absent" | "Late", string> = {
  Present:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Absent: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  Late: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const departmentIcons: Record<string, string> = {
  "Computer Science": "💻",
  "Mathematics": "📐",
  "Physics": "⚛️",
  "English": "📚",
  "Chemistry": "🧪",
  "Economics": "📊",
  "Urdu": "✍️",
  "Islamic Studies": "🕌",
};

export default function ManageAttendancePage() {
  const { user, isLoaded } = useUser();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceWithDetails[]>([]);
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [loading, setLoading] = useState(true);

  // Drill-down states
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedShift, setSelectedShift] = useState<string>("Morning");

  // Detailed Log dialog
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentStatsItem | null>(null);
  const [updatingLogId, setUpdatingLogId] = useState<string | null>(null);

  const role = useMemo(() => {
    const rawRole = user?.publicMetadata?.role as string | undefined;
    if (rawRole) {
      return rawRole.toLowerCase();
    }
    return "student";
  }, [user?.publicMetadata?.role]);

  const isAdmin = role === "admin";
  const isFaculty = role === "faculty";

  useEffect(() => {
    if (isLoaded && isAdmin) {
      if (!selectedDept) setSelectedDept("Computer Science");
      if (!selectedSemester) setSelectedSemester(1);
    }
  }, [isLoaded, isAdmin, selectedDept, selectedSemester]);

  // Faculty Struck Off dialog states
  const [struckOffDialogOpen, setStruckOffDialogOpen] = useState(false);
  const [struckOffStudent, setStruckOffStudent] = useState<StudentStatsItem | null>(null);
  const [struckOffReason, setStruckOffReason] = useState("");
  const [submittingStruckOff, setSubmittingStruckOff] = useState(false);

  const handleStruckOffClick = (student: StudentStatsItem) => {
    if (isFaculty) {
      setStruckOffStudent(student);
      setStruckOffReason("");
      setStruckOffDialogOpen(true);
    } else {
      handleToggleBlock(student);
    }
  };

  const handleStruckOffSubmit = async () => {
    if (!struckOffStudent || !struckOffReason.trim()) return;
    setSubmittingStruckOff(true);
    try {
      // 1. Block student
      await api.patch(`/api/students/${struckOffStudent.id}`, { blocked: true });
      
      // 2. Post announcement warning notice targeting their class
      await api.post("/api/announcements", {
        title: "Warning Notice: Student Struck Off",
        content: `Student ${struckOffStudent.user?.name || "Unknown"} (${struckOffStudent.rollNo}) has been struck off from attendance logs by instructor. Reason: ${struckOffReason}`,
        audience: "Students",
        priority: "High",
        targetDepartment: struckOffStudent.department,
        targetSemester: struckOffStudent.semester,
      });

      // 3. Update local state
      setStudents((prev) =>
        prev.map((s) => (s.id === struckOffStudent.id ? { ...s, blocked: true } : s))
      );
      if (selectedStudent && selectedStudent.id === struckOffStudent.id) {
        setSelectedStudent((prev) => (prev ? { ...prev, blocked: true } : null));
      }
      setStruckOffDialogOpen(false);
      setStruckOffStudent(null);
      setStruckOffReason("");
    } catch (err) {
      console.error("Failed to strike off student:", err);
    } finally {
      setSubmittingStruckOff(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    Promise.all([
      api.get<StudentItem[]>("/api/students"),
      api.get<AttendanceWithDetails[]>("/api/attendance"),
      api.get<CourseType[]>("/api/courses").catch(() => ({ data: [] })),
    ])
      .then(([studentsRes, attendanceRes, coursesRes]) => {
        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
        setAttendance(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const handleStatusChange = async (
    id: string,
    newStatus: "Present" | "Absent" | "Late"
  ) => {
    setUpdatingLogId(id);
    try {
      await api.patch(`/api/attendance/${id}`, { status: newStatus });
      setAttendance((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    } catch {
      /* ignore */
    } finally {
      setUpdatingLogId(null);
    }
  };

  const handleToggleBlock = async (student: StudentStatsItem) => {
    const nextState = !student.blocked;
    try {
      await api.patch(`/api/students/${student.id}`, { blocked: nextState, readmitRequested: false });
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, blocked: nextState, readmitRequested: false } : s))
      );
      if (selectedStudent && selectedStudent.id === student.id) {
        setSelectedStudent((prev) => (prev ? { ...prev, blocked: nextState, readmitRequested: false } : null));
      }
    } catch (err) {
      console.error("Failed to toggle student blocked status:", err);
    }
  };

  const handleRequestReadmission = async (student: StudentStatsItem) => {
    try {
      await api.patch(`/api/students/${student.id}`, { readmitRequested: true });
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, readmitRequested: true } : s))
      );
      if (selectedStudent && selectedStudent.id === student.id) {
        setSelectedStudent((prev) => (prev ? { ...prev, readmitRequested: true } : null));
      }
    } catch (err) {
      console.error("Failed to request re-admission:", err);
    }
  };

  const visibleDepartments = useMemo(() => {
    if (isAdmin) return DEPARTMENTS;
    if (isFaculty) {
      const facultyDepts = new Set(courses.map((c) => c.department));
      return DEPARTMENTS.filter((dept) => facultyDepts.has(dept));
    }
    return DEPARTMENTS.filter((dept) => students.some((s) => s.department === dept));
  }, [isAdmin, isFaculty, courses, students]);

  const visibleSemesters = useMemo(() => {
    const allSemesters = [1, 2, 3, 4, 5, 6, 7, 8];
    if (isAdmin) return allSemesters;
    if (isFaculty) {
      const facultySemesters = new Set(
        courses
          .filter((c) => c.department === selectedDept)
          .map((c) => c.semester)
      );
      return allSemesters.filter((sem) => facultySemesters.has(sem));
    }
    return allSemesters.filter((sem) =>
      students.some((s) => s.department === selectedDept && s.semester === sem)
    );
  }, [isAdmin, isFaculty, courses, selectedDept, students]);

  // Filter students in the selected class/shift
  const classStudents = useMemo(() => {
    if (!selectedDept || !selectedSemester) return [];
    return students.filter(
      (s) =>
        s.department === selectedDept &&
        s.semester === selectedSemester &&
        s.shift === selectedShift
    );
  }, [students, selectedDept, selectedSemester, selectedShift]);

  // Compute stats for each student in the selected class/shift
  const studentStats = useMemo(() => {
    return classStudents.map((student) => {
      const studentRecords = attendance.filter((a) => a.studentId === student.id);
      const total = studentRecords.length;
      const present = studentRecords.filter((a) => a.status === "Present").length;
      const absent = studentRecords.filter((a) => a.status === "Absent").length;
      const late = studentRecords.filter((a) => a.status === "Late").length;
      const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      return {
        ...student,
        stats: {
          total,
          present,
          absent,
          late,
          rate,
        },
      };
    });
  }, [classStudents, attendance]);

  // Compute class-wide overall stats
  const classStats = useMemo(() => {
    let overallTotal = 0;
    let overallPresent = 0;
    let overallAbsent = 0;
    let overallLate = 0;

    studentStats.forEach((s) => {
      overallTotal += s.stats.total;
      overallPresent += s.stats.present;
      overallAbsent += s.stats.absent;
      overallLate += s.stats.late;
    });

    const overallRate =
      overallTotal > 0
        ? Math.round(((overallPresent + overallLate) / overallTotal) * 100)
        : 0;

    return {
      totalStudents: classStudents.length,
      overallTotal,
      overallPresent,
      overallAbsent,
      overallLate,
      overallRate,
    };
  }, [studentStats, classStudents]);

  const [filterDate, setFilterDate] = useState<string>("");

  // Fetch detailed logs of selected student
  const selectedStudentLogs = useMemo(() => {
    if (!selectedStudent) return [];
    return attendance.filter((a) => {
      if (a.studentId !== selectedStudent.id) return false;
      if (filterDate) {
        const logDateStr = new Date(a.date).toISOString().split("T")[0];
        if (logDateStr !== filterDate) return false;
      }
      return true;
    });
  }, [selectedStudent, attendance, filterDate]);

  const columns: Column<StudentStatsItem>[] = [
    {
      key: "user",
      header: "Student",
      sortable: true,
      render: (row) => {
        const pct = row.stats.total > 0 ? Math.round(((row.stats.present + row.stats.late) / row.stats.total) * 100) : 100;
        return (
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectedStudent(row);
                  setLogDialogOpen(true);
                }}
                className="font-bold text-foreground hover:text-brand-primary hover:underline transition-colors text-left cursor-pointer"
                title="Click to view 3-month attendance history"
              >
                {row.user?.name ?? "—"}
              </button>
              {pct < 75 && !row.blocked && (
                <Badge variant="destructive" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] py-0 px-1.5 uppercase font-bold tracking-wider">
                  Shortage Alert ({pct}%)
                </Badge>
              )}
              {row.blocked && (
                <Badge variant="destructive" className="text-[10px] py-0 px-1.5 uppercase font-bold tracking-wider animate-pulse">
                  Struck Off
                </Badge>
              )}
              {row.readmitRequested && (
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 uppercase font-bold tracking-wider bg-amber-500/20 text-amber-600 border border-amber-500/30">
                  Pending Re-Admission
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-mono">{row.rollNo}</p>
          </div>
        );
      },
    },
    {
      key: "totalLectures" as keyof StudentStatsItem,
      header: "Total Lectures",
      render: (row) => (
        <span className="font-mono font-bold text-foreground">
          {row.stats.total} {row.stats.total === 1 ? "Lec" : "Lecs"}
        </span>
      ),
    },
    {
      key: "present",
      header: "Present",
      render: (row) => (
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
          {row.stats.present}
        </span>
      ),
    },
    {
      key: "late",
      header: "Late",
      render: (row) => (
        <span className="text-amber-600 dark:text-amber-400 font-bold">
          {row.stats.late}
        </span>
      ),
    },
    {
      key: "absent",
      header: "Absent",
      render: (row) => (
        <span className="text-rose-600 dark:text-rose-400 font-bold">
          {row.stats.absent}
        </span>
      ),
    },
    {
      key: "rate",
      header: "Attendance Rate",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="font-bold text-sm min-w-10">{row.stats.rate}%</span>
          <div className="w-24 bg-muted h-2 rounded-full overflow-hidden shrink-0">
            <div
              className={`h-full transition-all duration-500 ${
                row.stats.rate >= 75
                  ? "bg-emerald-500"
                  : row.stats.rate >= 60
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${row.stats.rate}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedStudent(row);
              setLogDialogOpen(true);
            }}
            className="h-8 text-xs gap-1 border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-all rounded-lg"
          >
            <Eye className="h-3.5 w-3.5" />
            View Logs
          </Button>

          {row.blocked ? (
            isAdmin ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleBlock(row)}
                className="h-8 text-xs gap-1 rounded-lg border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white font-bold"
              >
                Activate / Restore
              </Button>
            ) : row.readmitRequested ? (
              <Badge variant="outline" className="text-xs py-1 px-2 bg-amber-500/10 text-amber-600 border-amber-500/30">
                Re-Admission Requested
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRequestReadmission(row)}
                className="h-8 text-xs gap-1 rounded-lg border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white font-semibold"
              >
                Request Re-Admission
              </Button>
            )
          ) : isFaculty ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleStruckOffClick(row)}
              className={`h-8 text-xs gap-1 rounded-lg ${
                row.stats.rate < 75
                  ? "bg-rose-600 hover:bg-rose-700 animate-pulse border-none text-white font-bold"
                  : ""
              }`}
            >
              Struck Off
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground font-medium px-2 py-1 bg-accent rounded-md">Active</span>
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
        title={
          isAdmin
            ? "Manage Attendance"
            : selectedDept === null
            ? "Manage Attendance"
            : selectedSemester === null
            ? selectedDept
            : `${selectedDept} - Semester ${selectedSemester}`
        }
        subtitle={
          isAdmin
            ? "Track and audit attendance histories across departments"
            : selectedDept === null
            ? "Track and audit attendance histories across departments"
            : selectedSemester === null
            ? "Select a semester to inspect student stats"
            : `Class Attendance Details (${selectedShift} Shift)`
        }
        breadcrumbs={
          isAdmin
            ? [
                { label: "Dashboard", href: "/dashboard" },
                { label: "Attendance" },
              ]
            : [
                { label: "Dashboard", href: "/dashboard" },
                ...(selectedDept === null
                  ? [{ label: "Attendance" }]
                  : [
                      {
                        label: "Attendance",
                        onClick: () => {
                          setSelectedDept(null);
                          setSelectedSemester(null);
                        },
                      },
                      ...(selectedSemester === null
                        ? [{ label: selectedDept }]
                        : [
                            {
                              label: selectedDept,
                              onClick: () => {
                                setSelectedSemester(null);
                              },
                            },
                            { label: `Semester ${selectedSemester}` },
                          ]),
                    ]),
              ]
        }
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2 border-2 border-border bg-card px-3 py-1.5 shadow-[2px_2px_0px_0px_var(--border)] cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_var(--border)] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_var(--border)] transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        }
      />

      <AnimatePresence mode="wait">
        {!isLoaded || loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TableSkeleton rows={10} />
          </motion.div>
        ) : selectedDept === null ? (
          /* Department Selection View */
          <motion.div
            key="departments"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {visibleDepartments.map((dept) => {
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
          </motion.div>
        ) : selectedSemester === null ? (
          /* Semester Selection View */
          <motion.div
            key="semesters"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
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
              {visibleSemesters.map((sem) => {
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
          </motion.div>
        ) : (
          /* Student Attendance Table with Stats & Shift Dropdown */
          <motion.div
            key="details"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Top Panel Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {isAdmin ? (
                <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-xl border border-border w-full">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Dept:</Label>
                    <Select value={selectedDept || ""} onValueChange={setSelectedDept}>
                      <SelectTrigger className="w-[180px] h-10 bg-card rounded-xl">
                        <SelectValue placeholder="Select Department" />
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

                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Sem:</Label>
                    <Select
                      value={String(selectedSemester || 1)}
                      onValueChange={(v) => setSelectedSemester(Number(v))}
                    >
                      <SelectTrigger className="w-[120px] h-10 bg-card rounded-xl">
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

                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase">Shift:</Label>
                    <Select value={selectedShift} onValueChange={setSelectedShift}>
                      <SelectTrigger className="w-[120px] h-10 bg-card rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Morning">Morning</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>

            {/* Stats Summary Panel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-5 bg-card border-2 border-border rounded-2xl flex flex-col justify-between shadow-sm">
                <span className="text-sm font-semibold text-muted-foreground uppercase">Total Students</span>
                <span className="text-3xl font-extrabold text-foreground mt-2">{classStats.totalStudents}</span>
              </div>
              <div className="p-5 bg-card border-2 border-border rounded-2xl flex flex-col justify-between shadow-sm">
                <span className="text-sm font-semibold text-muted-foreground uppercase">Overall Attendance Rate</span>
                <span className="text-3xl font-extrabold text-brand-primary mt-2">{classStats.overallRate}%</span>
              </div>
              <div className="p-5 bg-card border-2 border-border rounded-2xl flex flex-col justify-between shadow-sm">
                <span className="text-sm font-semibold text-muted-foreground uppercase">Presents / Lates</span>
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                  {classStats.overallPresent} <span className="text-lg font-medium text-muted-foreground">/ {classStats.overallLate}</span>
                </span>
              </div>
              <div className="p-5 bg-card border-2 border-border rounded-2xl flex flex-col justify-between shadow-sm">
                <span className="text-sm font-semibold text-muted-foreground uppercase">Absents</span>
                <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">{classStats.overallAbsent}</span>
              </div>
            </div>

            {/* Student Table */}
            <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-sm p-4">
              <DataTable
                data={studentStats}
                columns={columns}
                searchPlaceholder="Search by student name or roll no..."
                searchKeys={["rollNo"]}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Logs Dialog */}
      <Dialog open={logDialogOpen} onOpenChange={setLogDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border-none shadow-2xl overflow-hidden rounded-3xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-brand-primary via-brand-secondary to-brand-primary" />
          <DialogHeader className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <ClipboardCheck className="h-6 w-6 text-brand-primary" />
                  Attendance History Log
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Reviewing marked attendance for <strong>{selectedStudent?.user?.name}</strong> ({selectedStudent?.rollNo})
                </DialogDescription>
              </div>

              {/* 4-Month Calendar Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterDate(e.target.value)}
                  className="h-9 w-36 text-xs rounded-xl font-mono"
                  title="Filter by date (past 4 months)"
                />
                {filterDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterDate("")}
                    className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="py-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Course Attendance & Struck Off Threshold Guard */}
            {selectedStudent && selectedStudentLogs.length > 0 && (() => {
              const activeCourseCode = selectedStudentLogs[0]?.course.courseCode;
              const activeCourseId = selectedStudentLogs[0]?.courseId;
              const totalLogs = selectedStudentLogs.length;
              const presentLogs = selectedStudentLogs.filter(l => l.status === "Present" || l.status === "Late").length;
              const coursePct = totalLogs > 0 ? Math.round((presentLogs / totalLogs) * 100) : 100;

              const enrollment = selectedStudent.enrollments?.find(e => e.courseId === activeCourseId);
              const isStruckOffCourse = enrollment ? enrollment.blocked : selectedStudent.blocked;
              const isReadmitReqCourse = enrollment ? enrollment.readmitRequested : selectedStudent.readmitRequested;

              const handleEnrollmentStrikeOff = async () => {
                if (!enrollment) {
                  handleStruckOffClick(selectedStudent);
                  return;
                }
                setSubmittingStruckOff(true);
                try {
                  await api.patch(`/api/enrollments/${enrollment.id}`, { blocked: true });
                  await api.post("/api/announcements", {
                    title: `Warning Notice: Student Struck Off in ${activeCourseCode}`,
                    content: `Student ${selectedStudent.user?.name || "Unknown"} (${selectedStudent.rollNo}) has been struck off in ${activeCourseCode} due to ${coursePct}% attendance (<70%).`,
                    audience: "Students",
                    priority: "High",
                    targetDepartment: selectedStudent.department,
                    targetSemester: selectedStudent.semester,
                  });
                  setStudents((prev) =>
                    prev.map((s) =>
                      s.id === selectedStudent.id
                        ? {
                            ...s,
                            enrollments: s.enrollments?.map((e) =>
                              e.id === enrollment.id ? { ...e, blocked: true } : e
                            ),
                          }
                        : s
                    )
                  );
                  setSelectedStudent((prev) =>
                    prev
                      ? {
                          ...prev,
                          enrollments: prev.enrollments?.map((e) =>
                            e.id === enrollment.id ? { ...e, blocked: true } : e
                          ),
                        }
                      : null
                  );
                } catch (err) {
                  console.error("Failed to strike off for course:", err);
                } finally {
                  setSubmittingStruckOff(false);
                }
              };

              const handleEnrollmentReadmitRequest = async () => {
                if (!enrollment) return;
                try {
                  await api.patch(`/api/enrollments/${enrollment.id}`, { readmitRequested: true });
                  setStudents((prev) =>
                    prev.map((s) =>
                      s.id === selectedStudent.id
                        ? {
                            ...s,
                            enrollments: s.enrollments?.map((e) =>
                              e.id === enrollment.id ? { ...e, readmitRequested: true } : e
                            ),
                          }
                        : s
                    )
                  );
                  setSelectedStudent((prev) =>
                    prev
                      ? {
                          ...prev,
                          enrollments: prev.enrollments?.map((e) =>
                            e.id === enrollment.id ? { ...e, readmitRequested: true } : e
                          ),
                        }
                      : null
                  );
                } catch (err) {
                  console.error("Failed to request course re-admission:", err);
                }
              };

              return (
                <div className="mb-4 p-4 rounded-2xl bg-card border-2 border-border flex flex-wrap items-center justify-between gap-4 shadow-sm">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {activeCourseCode} Course Attendance
                    </span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xl font-extrabold ${coursePct >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {coursePct}%
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        ({presentLogs}/{totalLogs} lectures attended)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isStruckOffCourse ? (
                      isReadmitReqCourse ? (
                        <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30 text-xs py-1 px-3 font-bold animate-pulse">
                          Course Re-Admission Requested
                        </Badge>
                      ) : isFaculty ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEnrollmentReadmitRequest}
                          className="h-8 text-xs text-amber-600 border-amber-500 hover:bg-amber-500 hover:text-white rounded-xl font-semibold"
                        >
                          Request Course Re-Admission
                        </Button>
                      ) : (
                        <Badge variant="destructive" className="text-xs py-1 px-3 uppercase font-bold">
                          Struck Off for Course
                        </Badge>
                      )
                    ) : isFaculty ? (
                      <div className="flex flex-col items-end gap-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={coursePct >= 70 || submittingStruckOff}
                          onClick={handleEnrollmentStrikeOff}
                          className="h-8 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={coursePct >= 70 ? "Can only strike off if course attendance is below 70%" : "Strike off student for this course"}
                        >
                          {submittingStruckOff && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                          Strike Off ({activeCourseCode})
                        </Button>
                        {coursePct >= 70 && (
                          <span className="text-[10px] text-muted-foreground italic">
                            Required &lt;70% to Strike Off (Current: {coursePct}%)
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })()}

            {selectedStudentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No attendance records found for this student.</p>
            ) : (
              <div className="space-y-3">
                {selectedStudentLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-accent/40 border border-border rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {log.course.courseCode}{log.course.courseName ? ` - ${log.course.courseName}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={`${statusColors[log.status]} font-bold`}>{log.status}</Badge>

                      <Select
                        value={log.status}
                        disabled={updatingLogId === log.id}
                        onValueChange={(v) => handleStatusChange(log.id, v as "Present" | "Absent" | "Late")}
                      >
                        <SelectTrigger className="h-8 w-8 p-0 border-none bg-transparent hover:bg-accent/80 flex items-center justify-center rounded-lg">
                          {updatingLogId === log.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="Present">Mark Present</SelectItem>
                          <SelectItem value="Absent">Mark Absent</SelectItem>
                          <SelectItem value="Late">Mark Late</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Faculty Struck Off Dialog */}
      <Dialog open={struckOffDialogOpen} onOpenChange={(open) => { if (!submittingStruckOff) setStruckOffDialogOpen(open); }}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl overflow-hidden rounded-3xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-destructive" />
          <DialogHeader className="pt-6">
            <DialogTitle className="text-xl font-bold text-destructive">
              Struck Off Student
            </DialogTitle>
            <DialogDescription>
              Provide a reason for striking off <strong>{struckOffStudent?.user?.name}</strong> ({struckOffStudent?.rollNo}). A warning notice will be posted to the class.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="grid gap-2">
              <label htmlFor="reason" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Notice / Struck Off Reason
              </label>
              <textarea
                id="reason"
                disabled={submittingStruckOff}
                value={struckOffReason}
                onChange={(e) => setStruckOffReason(e.target.value)}
                placeholder="e.g., Consecutive absences / Shortage of attendance"
                className="min-h-[100px] w-full resize-none rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pb-6">
            <Button
              variant="ghost"
              disabled={submittingStruckOff}
              onClick={() => setStruckOffDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleStruckOffSubmit}
              disabled={submittingStruckOff || !struckOffReason.trim()}
              className="rounded-xl flex items-center gap-2"
            >
              {submittingStruckOff && <Loader2 className="h-4 w-4 animate-spin" />}
              {submittingStruckOff ? "Submitting..." : "Strike Off Student"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

