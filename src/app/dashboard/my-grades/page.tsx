"use client";

import { GraduationCap, Lock, Unlock, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { getStudentGrades, getStudentCourses, mockCourses } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const STUDENT_ID = "s1";

const chartConfig = {
  quiz: { label: "Quiz", color: "#3D5EE1" },
  assignment: { label: "Assignment", color: "#6FCCD8" },
  mid: { label: "Midterm", color: "#A78BFA" },
  final: { label: "Final", color: "#F59E0B" },
} satisfies ChartConfig;

export default function MyGradesPage() {
  const grades = getStudentGrades(STUDENT_ID);
  const courses = getStudentCourses(STUDENT_ID);

  const overallGPA =
    grades.length > 0
      ? +(grades.reduce((sum, g) => sum + g.gpa, 0) / grades.length).toFixed(2)
      : 0;

  const chartData = grades.map((g) => {
    const course = mockCourses.find((c) => c.id === g.courseId);
    return {
      course: course?.courseCode || g.courseId,
      quiz: g.quizMarks,
      assignment: g.assignmentMarks,
      mid: g.midMarks,
      final: g.finalMarks,
    };
  });

  const gpaColor = overallGPA >= 3.5 ? "text-emerald-500" : overallGPA >= 3.0 ? "text-amber-500" : "text-rose-500";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <PageHeader
        title="My Grades"
        subtitle="View your academic performance across all enrolled courses"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Grades" }]}
      />

      {/* Overall GPA Card */}
      <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10">
          <GraduationCap className="h-8 w-8 text-brand-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Overall GPA</p>
          <p className={`text-4xl font-bold tracking-tight ${gpaColor}`}>{overallGPA}</p>
          <p className="text-xs text-muted-foreground mt-1">Across {courses.length} courses</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Semester in progress</span>
        </div>
      </div>

      {/* Grade Breakdown Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Mark Distribution</h3>
        <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="course" tickLine={false} tickMargin={10} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="quiz" fill="var(--color-quiz)" radius={4} />
            <Bar dataKey="assignment" fill="var(--color-assignment)" radius={4} />
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
                <th className="text-left py-3 px-4 font-semibold text-foreground">Course</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">Quiz</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">Assignment</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">Mid</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">Final</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">Total</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">GPA</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => {
                const course = mockCourses.find((c) => c.id === g.courseId);
                const gpaClass = g.gpa >= 3.5 ? "text-emerald-500" : g.gpa >= 3.0 ? "text-amber-500" : "text-rose-500";
                return (
                  <tr key={g.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-medium text-foreground">{course?.name}</span>
                        <p className="text-xs text-muted-foreground font-mono">{course?.courseCode}</p>
                      </div>
                    </td>
                    <td className="text-center py-3 px-3 text-muted-foreground">{g.quizMarks}</td>
                    <td className="text-center py-3 px-3 text-muted-foreground">{g.assignmentMarks}</td>
                    <td className="text-center py-3 px-3 text-muted-foreground">{g.midMarks}</td>
                    <td className="text-center py-3 px-3 text-muted-foreground">{g.finalMarks}</td>
                    <td className="text-center py-3 px-3 font-semibold text-foreground">{g.total}</td>
                    <td className={`text-center py-3 px-3 font-bold ${gpaClass}`}>{g.gpa}</td>
                    <td className="text-center py-3 px-3">
                      {g.locked ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <Lock className="h-3 w-3 mr-1" /> Finalized
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <Unlock className="h-3 w-3 mr-1" /> In Progress
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
