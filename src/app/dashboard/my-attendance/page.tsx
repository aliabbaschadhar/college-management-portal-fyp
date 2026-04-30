"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

type AttendanceStatus = "Present" | "Absent" | "Late";

interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  student: { rollNo: string; user: { name: string | null } };
  course: { courseCode: string };
}

interface CourseOption {
  id: string;
  courseCode: string;
  courseName: string;
}

const statusColors: Record<AttendanceStatus, string> = {
  Present: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Absent: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  Late: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const chartConfig = {
  present: { label: "Present", color: "var(--color-system-success)" },
  absent: { label: "Absent", color: "var(--color-system-danger)" },
  late: { label: "Late", color: "var(--color-system-warning)" },
} satisfies ChartConfig;

export default function MyAttendancePage() {
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/attendance").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
    ])
      .then(([att, crs]: [AttendanceRecord[], CourseOption[]]) => {
        setAllAttendance(att);
        setCourses(crs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filterCourse === "all"
    ? allAttendance
    : allAttendance.filter((a) => a.courseId === filterCourse);

  const presentCount = filtered.filter((a) => a.status === "Present").length;
  const absentCount = filtered.filter((a) => a.status === "Absent").length;
  const lateCount = filtered.filter((a) => a.status === "Late").length;
  const totalCount = filtered.length;
  const attendancePercent = totalCount > 0 ? Math.round(((presentCount + lateCount) / totalCount) * 100) : 100;

  const chartData = courses.map((c) => {
    const courseAtt = allAttendance.filter((a) => a.courseId === c.id);
    return {
      course: c.courseCode,
      present: courseAtt.filter((a) => a.status === "Present").length,
      absent: courseAtt.filter((a) => a.status === "Absent").length,
      late: courseAtt.filter((a) => a.status === "Late").length,
    };
  });

  const columns: Column<AttendanceRecord>[] = [
    {
      key: "courseId", header: "Course", sortable: true, render: (row) => (
        <span className="font-mono text-sm">{row.course?.courseCode || row.courseId}</span>
      ),
    },
    {
      key: "date", header: "Date", sortable: true, render: (row) => (
        <span className="text-muted-foreground">{new Date(row.date).toLocaleDateString()}</span>
      ),
    },
    {
      key: "status", header: "Status", sortable: true, render: (row) => (
        <Badge variant="secondary" className={statusColors[row.status]}>
          {row.status}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <PageHeader
        title="My Attendance"
        subtitle="Track your attendance across all enrolled courses"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Attendance" }]}
        action={
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
        }
      />

      {/* Low Attendance Warning */}
      {attendancePercent < 75 && totalCount > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">Low Attendance Warning</p>
            <p className="text-xs text-rose-600 dark:text-rose-400/80 mt-0.5">
              Your attendance is at {attendancePercent}%. Minimum 75% is required to be eligible for examinations.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Attendance %" value={`${attendancePercent}%`} trend={attendancePercent >= 75 ? "Good" : "Low"} trendDirection={attendancePercent >= 75 ? "up" : "down"} icon={Clock} iconColor="var(--color-brand-primary)" iconBg="rgb(var(--color-brand-primary-rgb) / 0.1)" />
        <StatsCard title="Present" value={presentCount} trend={`of ${totalCount}`} trendDirection="up" icon={CheckCircle} iconColor="var(--color-system-success)" iconBg="rgb(var(--color-system-success-rgb) / 0.1)" />
        <StatsCard title="Absent" value={absentCount} trend={`of ${totalCount}`} trendDirection="down" icon={XCircle} iconColor="var(--color-system-danger)" iconBg="rgb(var(--color-system-danger-rgb) / 0.1)" />
        <StatsCard title="Late" value={lateCount} trend={`of ${totalCount}`} trendDirection="down" icon={AlertCircle} iconColor="var(--color-system-warning)" iconBg="rgb(var(--color-system-warning-rgb) / 0.1)" />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Course-wise Attendance Breakdown</h3>
        <ChartContainer config={chartConfig} className="min-h-[260px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="course" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="present" fill="var(--color-present)" radius={[4, 4, 0, 0]} stackId="a" />
            <Bar dataKey="late" fill="var(--color-late)" radius={0} stackId="a" />
            <Bar dataKey="absent" fill="var(--color-absent)" radius={[4, 4, 0, 0]} stackId="a" />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Table */}
      <div className="bg-card/50 backdrop-blur-sm border rounded-xl overflow-hidden shadow-sm">
        <DataTable
          data={filtered as unknown as Record<string, unknown>[]}
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          searchPlaceholder="Search by course..."
          searchKeys={["courseId"]}
        />
      </div>
    </motion.div>
  );
}
