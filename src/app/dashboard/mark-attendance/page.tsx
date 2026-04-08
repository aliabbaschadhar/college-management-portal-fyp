"use client";

import { useState, useEffect } from "react";
import { ClipboardCheck, CheckCircle, Users } from "lucide-react";
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

interface CourseOption {
  id: string;
  courseCode: string;
  courseName: string;
}

interface StudentOption {
  id: string;
  rollNo: string;
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
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceData, setAttendanceData] = useState<StudentAttendance[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d: CourseOption[]) => setCourses(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSubmitted(false);
    fetch("/api/students")
      .then((r) => r.json())
      .then((students: StudentOption[]) => {
        setAttendanceData(
          (Array.isArray(students) ? students : []).map((s) => ({ student: s, status: "Present" as AttendanceStatus }))
        );
      })
      .catch(() => setAttendanceData([]));
  };

  const toggleStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData((prev) =>
      prev.map((item) => (item.student.id === studentId ? { ...item, status } : item))
    );
  };

  const markAll = (status: AttendanceStatus) => {
    setAttendanceData((prev) => prev.map((item) => ({ ...item, status })));
  };

  const handleSubmit = async () => {
    if (!selectedCourse || attendanceData.length === 0) return;
    setSubmitting(true);
    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: selectedCourse,
        date: selectedDate,
        records: attendanceData.map((a) => ({ studentId: a.student.id, status: a.status })),
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const presentCount = attendanceData.filter((a) => a.status === "Present").length;
  const absentCount = attendanceData.filter((a) => a.status === "Absent").length;
  const lateCount = attendanceData.filter((a) => a.status === "Late").length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <PageHeader
        title="Mark Attendance"
        subtitle="Record student attendance for your courses"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Mark Attendance" }]}
      />

      {/* Course & Date Selector */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium text-foreground mb-2 block">Course</label>
            <Select value={selectedCourse} onValueChange={handleCourseChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.courseCode} — {c.courseName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[180px]">
            <label className="text-sm font-medium text-foreground mb-2 block">Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Attendance List */}
      {selectedCourse && attendanceData.length > 0 && (
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
              <Button variant="outline" size="sm" onClick={() => markAll("Present")} className="text-emerald-600">
                Mark All Present
              </Button>
              <Button variant="outline" size="sm" onClick={() => markAll("Absent")} className="text-rose-600">
                Mark All Absent
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Student</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Roll No</th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((item, i) => (
                    <tr key={item.student.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground">{i + 1}</td>
                      <td className="py-3 px-4 font-medium text-foreground">{item.student.user.name ?? "—"}</td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{item.student.rollNo}</td>
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
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Attendance saved successfully!</span>
              </div>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                <ClipboardCheck className="h-4 w-4" />
                {submitting ? "Saving..." : "Save Attendance"}
              </Button>
            )}
          </div>
        </>
      )}

      {selectedCourse && attendanceData.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No students enrolled</p>
        </div>
      )}
    </motion.div>
  );
}
