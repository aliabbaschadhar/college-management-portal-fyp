"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "@/lib/axios";
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Calendar, Eye } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatsCardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/ui";
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
  course: { courseCode: string; courseName?: string };
}

interface CourseOption {
  id: string;
  courseCode: string;
  courseName: string;
}

const statusColors: Record<AttendanceStatus, string> = {
  Present:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
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
  const [refreshing, setRefreshing] = useState(false);

  // Modal state for 3-Month Course Attendance History
  const [selectedCourseModal, setSelectedCourseModal] = useState<CourseOption | null>(null);

  const fetchAttendanceData = useCallback(async () => {
    try {
      const [attRes, crsRes] = await Promise.all([
        api.get<AttendanceRecord[]>("/api/attendance"),
        api.get<CourseOption[]>("/api/courses"),
      ]);
      setAllAttendance(Array.isArray(attRes.data) ? attRes.data : []);
      setCourses(Array.isArray(crsRes.data) ? crsRes.data : []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAttendanceData();
    setRefreshing(false);
  };

  const filtered =
    filterCourse === "all"
      ? allAttendance
      : allAttendance.filter((a) => a.courseId === filterCourse);

  const presentCount = filtered.filter((a) => a.status === "Present").length;
  const absentCount = filtered.filter((a) => a.status === "Absent").length;
  const lateCount = filtered.filter((a) => a.status === "Late").length;
  const totalCount = filtered.length;
  const attendancePercent =
    totalCount > 0
      ? Math.round(((presentCount + lateCount) / totalCount) * 100)
      : 0;

  const chartData = courses.map((c) => {
    const courseAtt = allAttendance.filter((a) => a.courseId === c.id);
    return {
      course: c.courseCode,
      present: courseAtt.filter((a) => a.status === "Present").length,
      absent: courseAtt.filter((a) => a.status === "Absent").length,
      late: courseAtt.filter((a) => a.status === "Late").length,
    };
  });

  // Calculate 3-month (90 days) history for selected course
  const courseThreeMonthLogs = useMemo(() => {
    if (!selectedCourseModal) return [];
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    return allAttendance
      .filter((a) => a.courseId === selectedCourseModal.id)
      .filter((a) => new Date(a.date) >= ninetyDaysAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedCourseModal, allAttendance]);

  const columns: Column<AttendanceRecord>[] = [
    {
      key: "courseId",
      header: "Course",
      sortable: true,
      render: (row) => {
        const foundCourse = courses.find((c) => c.id === row.courseId);
        return (
          <button
            onClick={() => {
              if (foundCourse) setSelectedCourseModal(foundCourse);
            }}
            className="flex items-center gap-2 group text-left hover:underline cursor-pointer"
          >
            <span className="font-bold text-foreground group-hover:text-brand-primary">
              {row.course?.courseCode || row.courseId}
            </span>
            <Eye className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-brand-primary transition-opacity" />
          </button>
        );
      },
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (row) => (
        <span className="text-muted-foreground">
          {new Date(row.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (row) => (
        <Badge variant="secondary" className={statusColors[row.status]}>
          {row.status}
        </Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse border-2 border-border" />
          <div className="h-4 w-72 bg-muted animate-pulse border-2 border-border" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
          <StatsCardSkeleton />
        </div>
        <ChartSkeleton />
        <TableSkeleton rows={6} />
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
      <PageHeader
        title="My Attendance"
        subtitle="Track your attendance across all enrolled courses"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Attendance" },
        ]}
        action={
          <div className="flex items-center gap-3">
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectTrigger className="w-[180px] rounded-xl">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.courseName} ({c.courseCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
          </div>
        }
      />

      {/* Low Attendance Warning */}
      {attendancePercent < 75 && totalCount > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30 p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
              Low Attendance Warning
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400/80 mt-0.5">
              Your attendance is at {attendancePercent}%. Minimum 75% is
              required to be eligible for examinations.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Attendance %"
          value={`${attendancePercent}%`}
          trend={attendancePercent >= 75 ? "Good" : "Low"}
          trendDirection={attendancePercent >= 75 ? "up" : "down"}
          icon={Clock}
          iconColor="var(--color-brand-primary)"
          iconBg="rgb(var(--color-brand-primary-rgb) / 0.1)"
        />
        <StatsCard
          title="Present"
          value={presentCount}
          trend={`of ${totalCount}`}
          trendDirection="up"
          icon={CheckCircle}
          iconColor="var(--color-system-success)"
          iconBg="rgb(var(--color-system-success-rgb) / 0.1)"
        />
        <StatsCard
          title="Absent"
          value={absentCount}
          trend={`of ${totalCount}`}
          trendDirection="down"
          icon={XCircle}
          iconColor="var(--color-system-danger)"
          iconBg="rgb(var(--color-system-danger-rgb) / 0.1)"
        />
        <StatsCard
          title="Late"
          value={lateCount}
          trend={`of ${totalCount}`}
          trendDirection="down"
          icon={AlertCircle}
          iconColor="var(--color-system-warning)"
          iconBg="rgb(var(--color-system-warning-rgb) / 0.1)"
        />
      </div>

      {/* Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Course-wise Attendance Breakdown
        </h3>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="course"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="present"
              fill="var(--color-present)"
              radius={[4, 4, 0, 0]}
              stackId="a"
            />
            <Bar
              dataKey="late"
              fill="var(--color-late)"
              radius={0}
              stackId="a"
            />
            <Bar
              dataKey="absent"
              fill="var(--color-absent)"
              radius={[4, 4, 0, 0]}
              stackId="a"
            />
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

      {/* 3-Month Course Attendance History Dialog */}
      <Dialog open={!!selectedCourseModal} onOpenChange={(open) => { if (!open) setSelectedCourseModal(null); }}>
        <DialogContent className="sm:max-w-[550px] border-none shadow-2xl overflow-hidden rounded-3xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-brand-primary via-brand-secondary to-brand-primary" />
          <DialogHeader className="pt-6">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-brand-primary" />
              {selectedCourseModal?.courseCode} - 3-Month Attendance History
            </DialogTitle>
            <DialogDescription className="mt-1">
              Reviewing your past 90-day attendance record for <strong>{selectedCourseModal?.courseName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-[55vh] overflow-y-auto pr-1">
            {courseThreeMonthLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No attendance records found for this course in the last 3 months.
              </p>
            ) : (
              <div className="space-y-3">
                {courseThreeMonthLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-accent/30 border border-border rounded-2xl flex items-center justify-between gap-4 hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-sm text-foreground">
                        {log.course?.courseCode}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge className={`${statusColors[log.status]} font-bold`}>
                      {log.status}
                    </Badge>
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

