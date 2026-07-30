"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardCheck, CheckCircle, Users, RefreshCw } from "lucide-react";
import { api } from "@/lib/axios";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "@/components/ui";
import { Label } from "@/components/ui/label";

interface CourseOption {
  id: string;
  courseCode: string;
  courseName: string;
  department: string;
  semester: number;
}

interface StudentOption {
  id: string;
  rollNo: string;
  shift: string;
  blocked: boolean;
  user: { name: string | null };
}

type AttendanceStatus = "Present" | "Absent" | "Late";

interface StudentAttendance {
  student: StudentOption;
  status: AttendanceStatus;
}

const statusStyles: Record<AttendanceStatus, { bg: string; active: string }> = {
  Present: { bg: "bg-muted hover:bg-emerald-500/10", active: "bg-emerald-500 text-white" },
  Absent: { bg: "bg-muted hover:bg-rose-500/10", active: "bg-rose-500 text-white" },
  Late: { bg: "bg-muted hover:bg-amber-500/10", active: "bg-amber-500 text-white" },
};

export default function MarkAttendancePage() {
  useUser();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedShift, setSelectedShift] = useState("morning");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch initial assigned courses list and set defaults
  const fetchCourses = useCallback(async () => {
    try {
      const res = await api.get<CourseOption[]>("/api/courses");
      const list = Array.isArray(res.data) ? res.data : [];
      setCourses(list);
      if (list.length > 0) {
        const firstDept = list[0].department;
        const deptSemesters = Array.from(
          new Set(list.filter((c) => c.department === firstDept).map((c) => c.semester))
        ).sort((a, b) => a - b);
        const firstSem = deptSemesters[0];
        const matchingCourse = list.find(
          (c) => c.department === firstDept && c.semester === firstSem
        );

        setSelectedDept(firstDept);
        if (firstSem !== undefined) setSelectedSemester(firstSem.toString());
        if (matchingCourse) setSelectedCourse(matchingCourse.id);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  };

  // Compute unique departments from assigned courses
  const depts = Array.from(new Set(courses.map((c) => c.department))).sort();

  // Compute unique semesters for chosen department
  const semesters = Array.from(
    new Set(
      courses
        .filter((c) => c.department === selectedDept)
        .map((c) => c.semester)
    )
  ).sort((a, b) => a - b);

  // Filter courses by department and semester
  const filteredCourses = courses.filter(
    (c) => c.department === selectedDept && c.semester === Number(selectedSemester)
  );

  // Load students & attendance when selectedCourse or selectedDate changes
  useEffect(() => {
    if (!selectedCourse) {
      setAttendanceData([]);
      return;
    }
    setLoadingStudents(true);
    setSubmitted(false);

    Promise.all([
      api.get<{ enrollments?: { student: StudentOption }[] }>(`/api/courses/${selectedCourse}`),
      api.get<{ studentId: string; status: AttendanceStatus }[]>(
        `/api/attendance?courseId=${selectedCourse}&date=${selectedDate}`
      ).catch(() => ({ data: [] }))
    ])
      .then(([courseRes, attendanceRes]) => {
        const enrollments = courseRes.data.enrollments || [];
        const students = enrollments.map((e) => e.student).filter(Boolean);
        const prevRecords = attendanceRes.data || [];

        // Map studentId to existing status
        const statusMap = new Map(prevRecords.map((r) => [r.studentId, r.status]));

        setAttendanceData(
          students.map((s) => ({
            student: s,
            status: statusMap.get(s.id) || "Present",
          }))
        );
      })
      .catch((err) => {
        console.error("Failed to load attendance/students:", err);
        setAttendanceData([]);
      })
      .finally(() => {
        setLoadingStudents(false);
      });
  }, [selectedCourse, selectedDate]);

  const toggleStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData((prev) =>
      prev.map((item) => (item.student.id === studentId ? { ...item, status } : item))
    );
  };

  const markAll = (status: AttendanceStatus) => {
    setAttendanceData((prev) =>
      prev.map((item) => {
        // Only apply to current visible/filtered students
        const matchesShift =
          selectedShift === "all" ||
          item.student.shift?.toLowerCase() === selectedShift.toLowerCase();
        if (matchesShift) {
          return { ...item, status };
        }
        return item;
      })
    );
  };

  const handleSubmit = async () => {
    if (!selectedCourse || attendanceData.length === 0) return;
    setSubmitting(true);
    try {
      await api.post("/api/attendance", {
        courseId: selectedCourse,
        date: selectedDate,
        records: attendanceData.map((a) => ({ studentId: a.student.id, status: a.status })),
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      console.error("Failed to save attendance:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter attendance by shift selection
  const filteredStudents = attendanceData.filter((item) => {
    if (selectedShift === "all") return true;
    return item.student.shift?.toLowerCase() === selectedShift.toLowerCase();
  });

  const presentCount = filteredStudents.filter((a) => a.status === "Present").length;
  const absentCount = filteredStudents.filter((a) => a.status === "Absent").length;
  const lateCount = filteredStudents.filter((a) => a.status === "Late").length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <PageHeader
        title="Mark Attendance"
        subtitle="Record student attendance for your courses"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Mark Attendance" }]}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="geo-pressable flex items-center gap-2 border-2 border-border bg-card px-3 py-1.5 shadow-[2px_2px_0px_0px_var(--border)] cursor-pointer rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {/* Selectors */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Department</Label>
            <Select
              value={selectedDept}
              onValueChange={(val) => {
                setSelectedDept(val);
                setSelectedSemester("");
                setSelectedCourse("");
              }}
            >
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {depts.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Semester</Label>
            <Select
              value={selectedSemester}
              onValueChange={(val) => {
                setSelectedSemester(val);
                setSelectedCourse("");
              }}
              disabled={!selectedDept}
            >
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((s) => (
                  <SelectItem key={s} value={s.toString()}>
                    Semester {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Course</Label>
            <Select
              value={selectedCourse}
              onValueChange={(val) => setSelectedCourse(val)}
              disabled={!selectedSemester}
            >
              <SelectTrigger className="bg-card">
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {filteredCourses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.courseCode} — {c.courseName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Shift Filter</Label>
              <Select value={selectedShift} onValueChange={(val) => setSelectedShift(val)}>
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="All Shifts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 bg-card border-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      {loadingStudents ? (
        <TableSkeleton rows={6} />
      ) : (
        <>
          {selectedCourse && filteredStudents.length > 0 && (
            <>
              {/* Summary + Bulk Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 gap-1">
                    <CheckCircle className="h-3 w-3" /> {presentCount} Present
                  </Badge>
                  <Badge variant="secondary" className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                    {absentCount} Absent
                  </Badge>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {lateCount} Late
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => markAll("Present")} className="text-emerald-600 border-2">
                    Mark All Present
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => markAll("Absent")} className="text-rose-600 border-2">
                    Mark All Absent
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="text-left py-3 px-4 font-semibold text-foreground w-12">#</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Student</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Roll No</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground w-24">Shift</th>
                        <th className="text-center py-3 px-4 font-semibold text-foreground w-64">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((item, i) => (
                        <tr key={item.student.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                          <td className="py-3 px-4 text-muted-foreground font-medium">{i + 1}</td>
                          <td className="py-3 px-4 font-semibold text-foreground">
                            <div className="flex items-center gap-2">
                              <span>{item.student.user.name ?? "—"}</span>
                              {item.student.blocked && (
                                <Badge variant="destructive" className="text-[10px] py-0 px-1.5 uppercase font-bold tracking-wider animate-pulse">
                                  Struck Off
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-muted-foreground">{item.student.rollNo}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="secondary"
                              className={
                                item.student.shift?.toLowerCase() === "morning"
                                  ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                                  : "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
                              }
                            >
                              {item.student.shift ?? "Morning"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {(["Present", "Absent", "Late"] as AttendanceStatus[]).map((status) => (
                                <button
                                  key={status}
                                  onClick={() => toggleStatus(item.student.id, status)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    item.status === status
                                      ? statusStyles[status].active
                                      : statusStyles[status].bg
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end">
                {submitted ? (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-5 w-5 animate-bounce" />
                    <span className="text-sm font-semibold">Attendance saved successfully!</span>
                  </div>
                ) : (
                  <Button onClick={handleSubmit} disabled={submitting} className="gap-2 border-2">
                    <ClipboardCheck className="h-4 w-4" />
                    {submitting ? "Saving..." : "Save Attendance"}
                  </Button>
                )}
              </div>
            </>
          )}

          {selectedCourse && filteredStudents.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No students found matching current filters</p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

