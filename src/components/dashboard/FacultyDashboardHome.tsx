"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Star,
  FileText,
  ArrowRight,
  ClipboardCheck,
  CalendarDays,
  Bell,
  TrendingUp,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";

interface FacultyCourse {
  id: string;
  courseCode: string;
  courseName: string;
  enrolledCount: number;
}

interface FacultyTimetableEntry {
  id: string;
  day: string;
  courseCode: string;
  courseName: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface FacultyAnnouncement {
  id: string;
  title: string;
  priority: string;
  date: string;
}

interface FacultyDashboardData {
  stats: {
    totalCourses: number;
    totalStudents: number;
    avgRating: number;
    pendingQuizReviews: number;
  };
  courses: FacultyCourse[];
  timetable: FacultyTimetableEntry[];
  announcements: FacultyAnnouncement[];
}

interface Quiz {
  id: string;
  title: string;
  courseId: string;
  status: string;
  duration: number;
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

const CHART_COLORS = [
  "var(--color-data-1)",
  "var(--color-data-2)",
  "var(--color-data-3)",
  "var(--color-data-4)",
  "var(--color-data-5)",
  "var(--color-data-6)",
];

const attendancePieData = [
  { name: "Present", value: 78, fill: "var(--color-system-success)" },
  { name: "Late", value: 12, fill: "var(--color-system-warning)" },
  { name: "Absent", value: 10, fill: "var(--color-system-danger)" },
];

const attendancePieConfig: ChartConfig = {
  present: { label: "Present", color: "var(--color-system-success)" },
  late: { label: "Late", color: "var(--color-system-warning)" },
  absent: { label: "Absent", color: "var(--color-system-danger)" },
};

const defaultData: FacultyDashboardData = {
  stats: { totalCourses: 0, totalStudents: 0, avgRating: 0, pendingQuizReviews: 0 },
  courses: [],
  timetable: [],
  announcements: [],
};

export function FacultyDashboardHome() {
  useUser(); // Ensure user is authenticated
  const [data, setData] = useState<FacultyDashboardData>(defaultData);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/faculty").then((r) => r.json()),
      fetch("/api/quizzes").then((r) => r.json()).catch(() => []),
    ])
      .then(([dashData, quizData]: [FacultyDashboardData, Quiz[]]) => {
        setData(dashData);
        setQuizzes(Array.isArray(quizData) ? quizData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const today = days[new Date().getDay()];
  const todayClasses = data.timetable.filter((t) => t.day === today);

  const enrollmentData = data.courses.map((c, i) => ({
    course: c.courseCode,
    students: c.enrolledCount,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const enrollmentConfig: ChartConfig = Object.fromEntries(
    data.courses.map((c, i) => [
      c.courseCode,
      { label: c.courseName, color: CHART_COLORS[i % CHART_COLORS.length] },
    ])
  );

  const quickActions = [
    { title: "Mark Attendance", href: "/dashboard/mark-attendance", icon: ClipboardCheck, iconClass: "text-system-success", bgClass: "bg-system-success/10" },
    { title: "Enter Grades", href: "/dashboard/grades", icon: TrendingUp, iconClass: "text-brand-primary", bgClass: "bg-brand-primary/10" },
    { title: "Create Quiz", href: "/dashboard/quizzes", icon: FileText, iconClass: "text-data-3", bgClass: "bg-data-3/10" },
    { title: "Question Bank", href: "/dashboard/question-bank", icon: BookOpen, iconClass: "text-data-4", bgClass: "bg-data-4/10" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <PageHeader
        title="Faculty Dashboard 🎓"
        subtitle="Manage your courses, students, and academic activities."
      />

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="My Courses"
          value={data.stats.totalCourses}
          trend="Active"
          trendDirection="up"
          icon={BookOpen}
          iconColor="var(--color-brand-primary)"
          iconBg="rgb(var(--color-brand-primary-rgb) / 0.1)"
        />
        <StatsCard
          title="Total Students"
          value={data.stats.totalStudents}
          trend="Across courses"
          trendDirection="up"
          icon={Users}
          iconColor="var(--color-brand-secondary)"
          iconBg="rgb(var(--color-brand-secondary-rgb) / 0.1)"
        />
        <StatsCard
          title="Avg Feedback"
          value={`${data.stats.avgRating}/5`}
          trend={data.stats.avgRating >= 4 ? "Excellent" : "Good"}
          trendDirection="up"
          icon={Star}
          iconColor="var(--color-data-4)"
          iconBg="color-mix(in oklab, var(--color-data-4) 10%, transparent)"
        />
        <StatsCard
          title="Active Quizzes"
          value={data.stats.pendingQuizReviews}
          trend="Published"
          trendDirection="up"
          icon={FileText}
          iconColor="var(--color-data-3)"
          iconBg="color-mix(in oklab, var(--color-data-3) 10%, transparent)"
        />
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Student Distribution */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Students per Course</h3>
          <ChartContainer config={enrollmentConfig} className="min-h-[280px] w-full">
            <BarChart accessibilityLayer data={enrollmentData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="course" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="students" radius={[8, 8, 0, 0]}>
                {enrollmentData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        {/* Attendance Pie */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Today&apos;s Attendance Overview</h3>
          <ChartContainer config={attendancePieConfig} className="min-h-[280px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={attendancePieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
              >
                {attendancePieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      </motion.div>

      {/* Bottom section */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Schedule */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Today&apos;s Schedule</h3>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </div>
          {todayClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No classes today. 🎉</p>
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
                    <p className="text-sm font-medium text-foreground">{cls.courseCode}</p>
                    <p className="text-xs text-muted-foreground">
                      {cls.startTime} - {cls.endTime} • {cls.room}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Quizzes */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">My Quizzes</h3>
            <Link href="/dashboard/quizzes" className="text-xs text-brand-primary hover:underline">
              Manage
            </Link>
          </div>
          {quizzes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No quizzes created yet.</p>
          ) : (
            <div className="space-y-3">
              {quizzes.slice(0, 4).map((quiz) => {
                const statusColors: Record<string, string> = {
                  Draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                  Published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                  Closed: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
                };
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
                        {quiz.questions.length} questions • {quiz.duration} mins
                      </p>
                    </div>
                    <Badge variant="secondary" className={statusColors[quiz.status] ?? ""}>
                      {quiz.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions + Announcements */}
        <div className="space-y-4">
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
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${qa.bgClass}`}
                  >
                    <qa.icon className={`h-3.5 w-3.5 ${qa.iconClass}`} />
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
              {data.announcements.slice(0, 3).map((ann) => (
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
              {data.announcements.length === 0 && (
                <p className="text-sm text-muted-foreground">No announcements.</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
