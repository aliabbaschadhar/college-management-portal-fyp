"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { GraduationCap, Lock, Unlock, TrendingUp, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartSkeleton, TableSkeleton } from "@/components/ui";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface GradeWithCourse {
  id: string;
  studentId: string;
  courseId: string;
  quizMarks: number;
  assignmentMarks: number;
  midMarks: number;
  finalMarks: number;
  total: number;
  gpa: number;
  locked: boolean;
  student: { rollNo: string; user: { name: string | null }; cgpa: number };
  course: { courseCode: string; courseName: string };
}

const chartConfig = {
  mid: { label: "Midterm", color: "var(--color-data-3)" },
  final: { label: "Sessional", color: "var(--color-data-4)" },
} satisfies ChartConfig;

export default function MyGradesPage() {
  const [grades, setGrades] = useState<GradeWithCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGrades = async () => {
    try {
      const r = await api.get<GradeWithCourse[]>("/api/grades");
      setGrades(r.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchGrades();
    setRefreshing(false);
  };

  const previousCGPA = grades[0]?.student?.cgpa ?? 0.0;

  const chartData = grades.map((g) => ({
    course: g.course?.courseCode || g.courseId,
    mid: g.midMarks,
    final: g.finalMarks,
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-muted animate-pulse border-2 border-border" />
          <div className="h-4 w-72 bg-muted animate-pulse border-2 border-border" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-6 animate-pulse">
          <div className="h-16 w-16 rounded-2xl bg-muted border-2 border-border" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 bg-muted border-2 border-border" />
            <div className="h-10 w-20 bg-muted border-2 border-border" />
          </div>
        </div>
        <ChartSkeleton />
        <TableSkeleton rows={5} />
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
        title="My Grades"
        subtitle="View your academic performance across all enrolled courses"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Grades" },
        ]}
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

      {/* Overall GPA Card */}
      <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10">
          <GraduationCap className="h-8 w-8 text-brand-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Previous Semester CGPA</p>
          <p className="text-4xl font-bold tracking-tight text-brand-primary">
            {grades.length > 0 ? previousCGPA.toFixed(2) : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            CGPA from previous semesters
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Semester in progress</span>
        </div>
      </div>

      {/* Grade Breakdown Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Mark Distribution
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
            <Bar dataKey="mid" fill="var(--color-mid)" radius={4} />
            <Bar dataKey="final" fill="var(--color-final)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>

      {/* Grade Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-semibold text-foreground">
                  Course
                </th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">
                  Mid Exam (25)
                </th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">
                  Sessional (15)
                </th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">
                  Total (40)
                </th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">
                  Obtained Marks
                </th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => {
                return (
                  <tr
                    key={g.id}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold text-foreground">
                          {g.course?.courseName || ""} {g.course?.courseCode || ""}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-3 text-muted-foreground">
                      {g.midMarks}
                    </td>
                    <td className="text-center py-3 px-3 text-muted-foreground">
                      {g.finalMarks}
                    </td>
                    <td className="text-center py-3 px-3 font-semibold text-foreground">
                      {g.total}
                    </td>
                    <td
                      className="text-center py-3 px-3 font-bold text-foreground"
                    >
                      {g.total} / 40
                    </td>
                    <td className="text-center py-3 px-3">
                      {g.locked ? (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        >
                          <Lock className="h-3 w-3 mr-1" /> Finalized
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        >
                          <Unlock className="h-3 w-3 mr-1" /> In Progress
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
              {grades.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No grades available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
