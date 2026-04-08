"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import {
  GraduationCap,
  Clock,
  CreditCard,
  BookOpen,
  ArrowRight,
  FileText,
  CalendarDays,
  Bell,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface TimetableEntry {
  id: string;
  day: string;
  room: string;
  startTime: string;
  endTime: string;
  course: {
    courseCode: string;
    courseName: string;
    department: string;
    semester: number;
    faculty: { user: { name: string | null } } | null;
  };
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  audience: string;
  priority: string;
}

interface Quiz {
  id: string;
  title: string;
  courseId: string;
  duration: number;
  status: string;
  dueDate: string;
  questions: string[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const attendanceChartConfig = {
  present: { label: "Present", color: "var(--color-system-success)" },
  absent: { label: "Absent", color: "var(--color-system-danger)" },
  late: { label: "Late", color: "var(--color-system-warning)" },
} satisfies ChartConfig;

const gradeChartConfig = {
  quiz: { label: "Quiz", color: "var(--color-brand-primary)" },
  assignment: { label: "Assignment", color: "var(--color-brand-secondary)" },
  mid: { label: "Mid", color: "var(--color-data-3)" },
  final: { label: "Final", color: "var(--color-data-4)" },
} satisfies ChartConfig;

export function StudentDashboardHome() {
  const { user } = useUser();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/timetable").then((r) => r.json()).catch(() => []),
      fetch("/api/announcements?audience=Students").then((r) => r.json()).catch(() => []),
      fetch("/api/quizzes").then((r) => r.json()).catch(() => []),
    ]).then(([tt, ann, qz]: [TimetableEntry[], Announcement[], Quiz[]]) => {
      setTimetable(Array.isArray(tt) ? tt : []);
      setAnnouncements(Array.isArray(ann) ? ann : []);
      setQuizzes(Array.isArray(qz) ? qz : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const pendingQuizzes = quizzes.filter((q) => q.status === "Published");

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];
  const todayClasses = timetable.filter((t) => t.day === today);

  // Placeholder chart data (student-specific stats require a dedicated API endpoint)
  const attendanceChartData = useMemo(
    () =>
      timetable.slice(0, 5).map((t, i) => ({
        course: t.course.courseCode,
        present: 20 + ((i * 7 + 3) % 5),
        absent: 1 + ((i * 3 + 1) % 3),
        late: (i * 5 + 2) % 3,
      })),
    [timetable]
  );

  const gradeChartData = useMemo(
    () =>
      timetable.slice(0, 5).map((t, i) => ({
        course: t.course.courseCode,
        quiz: 12 + ((i * 5 + 2) % 8),
        assignment: 15 + ((i * 7 + 3) % 8),
        mid: 25 + ((i * 11 + 5) % 15),
        final: 30 + ((i * 13 + 7) % 15),
      })),
    [timetable]
  );

  const quickActions = [
    {
      title: "View Courses",
      href: "/dashboard/my-courses",
      icon: BookOpen,
      iconColor: "var(--color-brand-primary)",
      iconBg: "rgb(var(--color-brand-primary-rgb) / 0.1)",
    },
    {
      title: "My Attendance",
      href: "/dashboard/my-attendance",
      icon: Clock,
      iconColor: "var(--color-system-success)",
      iconBg: "rgb(var(--color-system-success-rgb) / 0.1)",
    },
    {
      title: "Take a Quiz",
      href: "/dashboard/take-quiz",
      icon: FileText,
      iconColor: "var(--color-data-3)",
      iconBg: "color-mix(in oklab, var(--color-data-3) 10%, transparent)",
    },
    {
      title: "View Timetable",
      href: "/dashboard/my-timetable",
      icon: CalendarDays,
      iconColor: "var(--color-brand-secondary)",
      iconBg: "rgb(var(--color-brand-secondary-rgb) / 0.1)",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const firstName = user?.firstName ?? "Student";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <PageHeader
        title={`Welcome, ${firstName}! 👋`}
        subtitle="Here's your academic snapshot for today."
      />

      {/* Stats — TODO: wire to /api/dashboard/student once endpoint is available */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Current GPA"
          value="—"
          trend="N/A"
          trendDirection="up"
          icon={GraduationCap}
          iconColor="var(--color-brand-primary)"
          iconBg="rgb(var(--color-brand-primary-rgb) / 0.1)"
        />
        <StatsCard
          title="Attendance"
          value="—"
          trend="N/A"
          trendDirection="up"
          icon={Clock}
          iconColor="var(--color-system-success)"
          iconBg="rgb(var(--color-system-success-rgb) / 0.1)"
        />
        <StatsCard
          title="Pending Dues"
          value="—"
          trend="N/A"
          trendDirection="up"
          icon={CreditCard}
          iconColor="var(--color-system-danger)"
          iconBg="rgb(var(--color-system-danger-rgb) / 0.1)"
        />
        <StatsCard
          title="Enrolled Courses"
          value={timetable.length}
          trend="Active"
          trendDirection="up"
          icon={BookOpen}
          iconColor="var(--color-data-3)"
          iconBg="color-mix(in oklab, var(--color-data-3) 10%, transparent)"
        />
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attendance Chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Attendance by Course</h3>
          <ChartContainer config={attendanceChartConfig} className="min-h-[280px] w-full">
            <BarChart accessibilityLayer data={attendanceChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="course"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="present" fill="var(--color-present)" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="late" fill="var(--color-late)" radius={0} stackId="a" />
              <Bar dataKey="absent" fill="var(--color-absent)" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Grade Breakdown */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Grade Breakdown</h3>
          <ChartContainer config={gradeChartConfig} className="min-h-[280px] w-full">
            <BarChart accessibilityLayer data={gradeChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="course"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="quiz" fill="var(--color-quiz)" radius={4} />
              <Bar dataKey="assignment" fill="var(--color-assignment)" radius={4} />
              <Bar dataKey="mid" fill="var(--color-mid)" radius={4} />
              <Bar dataKey="final" fill="var(--color-final)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
      </motion.div>

      {/* Bottom section */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Classes */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Today&apos;s Classes</h3>
          {todayClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No classes scheduled for today. 🎉</p>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((cls, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg p-3 bg-accent/30 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
                    <BookOpen className="h-4 w-4 text-brand-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{cls.course.courseCode}</p>
                    <p className="text-xs text-muted-foreground">
                      {cls.startTime} - {cls.endTime} • {cls.room}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Quizzes */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Upcoming Quizzes</h3>
            <Link href="/dashboard/take-quiz" className="text-xs text-brand-primary hover:underline">
              View All
            </Link>
          </div>
          {pendingQuizzes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending quizzes. 🎯</p>
          ) : (
            <div className="space-y-3">
              {pendingQuizzes.slice(0, 3).map((quiz) => {
                const now = new Date();
                const daysLeft = Math.ceil(
                  (new Date(quiz.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={quiz.id}
                    className="flex items-center gap-3 rounded-lg p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                      <FileText className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{quiz.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {quiz.duration} mins
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        daysLeft <= 2
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }
                    >
                      {daysLeft}d left
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions + Announcements */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {quickActions.map((qa) => (
                <Link
                  key={qa.title}
                  href={qa.href}
                  className="group flex items-center gap-3 rounded-lg p-2.5 hover:bg-accent/50 transition-colors"
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: qa.iconBg }}
                  >
                    <qa.icon className="h-3.5 w-3.5" style={{ color: qa.iconColor }} />
                  </div>
                  <span className="text-sm font-medium text-foreground flex-1">{qa.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Announcements</h3>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              {announcements.slice(0, 3).map((ann) => (
                <div key={ann.id} className="rounded-lg p-2.5 bg-accent/20">
                  <p className="text-sm font-medium text-foreground">{ann.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(ann.date).toLocaleDateString()} •{" "}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {ann.priority}
                    </Badge>
                  </p>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-sm text-muted-foreground">No announcements.</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
