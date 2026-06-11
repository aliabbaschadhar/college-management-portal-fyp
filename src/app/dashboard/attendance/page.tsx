"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/axios";
import { ClipboardCheck, Filter, Eye, Loader2, Calendar } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui";
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
  course: { courseCode: string };
}

interface StudentItem {
  id: string;
  userId: string;
  rollNo: string;
  phone: string | null;
  department: string;
  semester: number;
  shift: string;
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
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [attendance, setAttendance] = useState<AttendanceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Drill-down states
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedShift, setSelectedShift] = useState<string>("Morning");

  // Detailed Log dialog
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentStatsItem | null>(null);
  const [updatingLogId, setUpdatingLogId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<StudentItem[]>("/api/students"),
      api.get<AttendanceWithDetails[]>("/api/attendance"),
    ])
      .then(([studentsRes, attendanceRes]) => {
        setStudents(Array.isArray(studentsRes.data) ? studentsRes.data : []);
        setAttendance(Array.isArray(attendanceRes.data) ? attendanceRes.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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

  // Fetch detailed logs of selected student
  const selectedStudentLogs = useMemo(() => {
    if (!selectedStudent) return [];
    return attendance.filter((a) => a.studentId === selectedStudent.id);
  }, [selectedStudent, attendance]);

  const columns: Column<StudentStatsItem>[] = [
    {
      key: "user",
      header: "Student",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-foreground">{row.user?.name ?? "—"}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.rollNo}</p>
        </div>
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
      key: "absent",
      header: "Absent",
      render: (row) => (
        <span className="text-rose-600 dark:text-rose-400 font-bold">
          {row.stats.absent}
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
          selectedDept === null
            ? "Manage Attendance"
            : selectedSemester === null
            ? selectedDept
            : `${selectedDept} - Semester ${selectedSemester}`
        }
        subtitle={
          selectedDept === null
            ? "Track and audit attendance histories across departments"
            : selectedSemester === null
            ? "Select a semester to inspect student stats"
            : `Class Attendance Details (${selectedShift} Shift)`
        }
        breadcrumbs={[
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
        ]}
      />

      <AnimatePresence mode="wait">
        {loading ? (
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
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6 text-brand-primary" />
              Attendance History Log
            </DialogTitle>
            <DialogDescription>
              Reviewing marked attendance for <strong>{selectedStudent?.user?.name}</strong> ({selectedStudent?.rollNo})
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-[60vh] overflow-y-auto pr-1">
            {selectedStudentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No attendance records found for this student.</p>
            ) : (
              <div className="space-y-3">
                {selectedStudentLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-accent/40 border border-border rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm text-foreground">Course: {log.course.courseCode}</p>
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
    </motion.div>
  );
}
