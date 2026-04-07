"use client";

import { Users, GraduationCap, BookOpen, UserPlus, ClipboardCheck, CreditCard, MessageSquare, Calendar, ArrowRight, UserCheck, DollarSign, Bell } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { adminDashboardStats, studentsPerDepartment, attendanceOverview, recentActivity } from "@/lib/mock-data";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const quickActions = [
  { title: "Add Student", href: "/dashboard/students", icon: UserPlus, color: "#3D5EE1" },
  { title: "Mark Attendance", href: "/dashboard/attendance", icon: ClipboardCheck, color: "#1ABE17" },
  { title: "Create Announcement", href: "/dashboard/announcements", icon: MessageSquare, color: "#EAB300" },
  { title: "Generate Timetable", href: "/dashboard/timetable", icon: Calendar, color: "#6FCCD8" },
];

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  admission: UserPlus,
  attendance: ClipboardCheck,
  fee: DollarSign,
  announcement: Bell,
  course: BookOpen,
  student: UserCheck,
};

const DEPT_COLORS = ["#3D5EE1", "#6FCCD8", "#A78BFA", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899"];

const barChartConfig: ChartConfig = {
  students: { label: "Students", color: "#3D5EE1" },
};

const doughnutConfig: ChartConfig = {
  present: { label: "Present", color: "#1ABE17" },
  absent: { label: "Absent", color: "#E82646" },
  late: { label: "Late", color: "#EAB300" },
};

export default function AdminDashboardHome() {
  const barChartData = studentsPerDepartment.labels.map((label, i) => ({
    department: label.length > 12 ? label.slice(0, 10) + "…" : label,
    students: studentsPerDepartment.data[i],
    fill: DEPT_COLORS[i % DEPT_COLORS.length],
  }));

  const pieData = attendanceOverview.labels.map((label, i) => ({
    name: label,
    value: attendanceOverview.data[i],
    fill: ["#1ABE17", "#E82646", "#EAB300"][i],
  }));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        subtitle="Welcome back! Here's what's happening at your college today."
      />

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={adminDashboardStats.totalStudents}
          trend="12%"
          trendDirection="up"
          icon={Users}
          iconColor="#3D5EE1"
          iconBg="rgba(61,94,225,0.1)"
        />
        <StatsCard
          title="Total Faculty"
          value={adminDashboardStats.totalFaculty}
          trend="3%"
          trendDirection="up"
          icon={GraduationCap}
          iconColor="#6FCCD8"
          iconBg="rgba(111,204,216,0.1)"
        />
        <StatsCard
          title="Active Courses"
          value={adminDashboardStats.activeCourses}
          trend="5%"
          trendDirection="up"
          icon={BookOpen}
          iconColor="#A78BFA"
          iconBg="rgba(167,139,250,0.1)"
        />
        <StatsCard
          title="Pending Admissions"
          value={adminDashboardStats.pendingAdmissions}
          trend="2"
          trendDirection="down"
          icon={UserPlus}
          iconColor="#F59E0B"
          iconBg="rgba(245,158,11,0.1)"
        />
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Students per Department</h3>
          <ChartContainer config={barChartConfig} className="min-h-[280px] w-full">
            <BarChart accessibilityLayer data={barChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="department"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="students" radius={[8, 8, 0, 0]}>
                {barChartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        {/* Doughnut chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Attendance Overview</h3>
          <ChartContainer config={doughnutConfig} className="min-h-[280px] w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        </div>
      </motion.div>

      {/* Bottom section: Activity + Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((act) => {
              const ActIcon = activityIcons[act.type] || Bell;
              return (
                <div
                  key={act.id}
                  className="flex items-start gap-3 rounded-lg p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
                    <ActIcon className="h-4 w-4 text-brand-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{act.action}</p>
                    <p className="text-xs text-muted-foreground">{act.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{act.timestamp}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((qa) => (
              <Link
                key={qa.title}
                href={qa.href}
                className="group flex items-center gap-3 rounded-lg p-3 hover:bg-accent/50 transition-colors"
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${qa.color}15` }}
                >
                  <qa.icon className="h-4 w-4" style={{ color: qa.color }} />
                </div>
                <span className="text-sm font-medium text-foreground flex-1">{qa.title}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>

          {/* Fee Summary */}
          <div className="mt-5 pt-4 border-t border-border">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Fee Summary</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Collected</span>
                <span className="text-sm font-semibold text-system-success">
                  PKR {adminDashboardStats.totalFeeCollected.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="text-sm font-semibold text-system-danger">
                  PKR {adminDashboardStats.totalFeePending.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
