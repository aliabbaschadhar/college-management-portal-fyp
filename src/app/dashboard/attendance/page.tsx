"use client";

import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

interface AttendanceWithDetails {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: "Present" | "Absent" | "Late";
  markedBy: string;
  student: { rollNo: string; user: { name: string | null } };
  course: { courseCode: string };
}

interface CourseOption {
  id: string;
  courseCode: string;
}

const statusColors: Record<"Present" | "Absent" | "Late", string> = {
  Present: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Absent: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  Late: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function ManageAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceWithDetails[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d: CourseOption[]) => setCourses(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterCourse !== "all") params.set("courseId", filterCourse);
    const url = `/api/attendance${params.size ? "?" + params.toString() : ""}`;
    fetch(url)
      .then((r) => r.json())
      .then((d: AttendanceWithDetails[]) => { setAttendance(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filterCourse]);

  const handleStatusChange = async (id: string, newStatus: "Present" | "Absent" | "Late") => {
    const res = await fetch(`/api/attendance/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setAttendance((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    }
  };

  const filtered = attendance.filter((a) => {
    return filterStatus === "all" || a.status === filterStatus;
  });

  const columns: Column<AttendanceWithDetails>[] = [
    { key: "student", header: "Student", sortable: false, render: (row) => (
      <div>
        <p className="font-medium text-foreground">{row.student.user.name ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{row.student.rollNo}</p>
      </div>
    )},
    { key: "course", header: "Course", sortable: false, render: (row) => (
      <span className="text-sm font-mono">{row.course.courseCode}</span>
    )},
    { key: "date", header: "Date", sortable: true, render: (row) => (
      <span className="text-muted-foreground">{new Date(row.date).toLocaleDateString()}</span>
    )},
    { key: "status", header: "Status", sortable: true, render: (row) => (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className={statusColors[row.status]}>
          {row.status}
        </Badge>
        <Select
          value={row.status}
          onValueChange={(v) => handleStatusChange(row.id, v as "Present" | "Absent" | "Late")}
        >
          <SelectTrigger className="h-7 w-[24px] p-0 border-none bg-transparent hover:bg-accent/50">
            <Filter className="h-3 w-3 text-muted-foreground" />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="Present">Present</SelectItem>
            <SelectItem value="Absent">Absent</SelectItem>
            <SelectItem value="Late">Late</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )},
  ];

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
        title="Manage Attendance"
        subtitle="Tracking student presence across all active courses"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Attendance" }]}
        action={
          <div className="flex items-center gap-3">
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.courseCode}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Present">Present</SelectItem>
                <SelectItem value="Absent">Absent</SelectItem>
                <SelectItem value="Late">Late</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="bg-card/50 backdrop-blur-sm border rounded-xl overflow-hidden shadow-sm">
        <DataTable
          data={filtered as unknown as Record<string, unknown>[]}
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          searchPlaceholder="Search by student name or roll no..."
          searchKeys={["studentId"]}
        />
      </div>
    </motion.div>
  );
}
