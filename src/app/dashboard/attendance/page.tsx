"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Clock, CalendarIcon, Filter } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { mockAttendance, mockStudents, mockCourses } from "@/lib/mock-data";
import type { Attendance } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

const statusColors: Record<Attendance["status"], string> = {
  Present: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Absent: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  Late: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function ManageAttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>(mockAttendance);
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredAttendance = attendance.filter((a) => {
    const courseMatch = filterCourse === "all" || a.courseId === filterCourse;
    const statusMatch = filterStatus === "all" || a.status === filterStatus;
    return courseMatch && statusMatch;
  });

  const handleStatusChange = (id: string, newStatus: Attendance["status"]) => {
    setAttendance((prev) => 
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const columns: Column<Attendance>[] = [
    { key: "studentId", header: "Student", sortable: true, render: (row) => {
      const student = mockStudents.find(s => s.id === row.studentId);
      return (
        <div>
          <p className="font-medium text-foreground">{student?.name || row.studentId}</p>
          <p className="text-xs text-muted-foreground">{student?.rollNo}</p>
        </div>
      );
    }},
    { key: "courseId", header: "Course", sortable: true, render: (row) => {
      const course = mockCourses.find(c => c.id === row.courseId);
      return <span className="text-sm font-mono">{course?.courseCode}</span>;
    }},
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
          onValueChange={(v) => handleStatusChange(row.id, v as Attendance["status"])}
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
                {mockCourses.map((c) => (
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
          data={filteredAttendance as unknown as Record<string, unknown>[]}
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          searchPlaceholder="Search by student name or roll no..."
          searchKeys={["studentId"]}
        />
      </div>
    </motion.div>
  );
}
