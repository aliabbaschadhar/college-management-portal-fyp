"use client";

import { Users, GraduationCap, BookOpen, UserPlus, ClipboardCheck, CreditCard, MessageSquare, Calendar, ArrowRight, UserCheck, DollarSign, Bell } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { adminDashboardStats, studentsPerDepartment, attendanceOverview, recentActivity } from "@/lib/mock-data";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

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

export default function AdminDashboardHome() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  const chartTextColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)";
  const chartGridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  const barChartData = {
    labels: studentsPerDepartment.labels.map((l) => (l.length > 12 ? l.slice(0, 10) + "…" : l)),
    datasets: [
      {
        label: "Students",
        data: studentsPerDepartment.data,
        backgroundColor: [
          "#3D5EE1", "#6FCCD8", "#A78BFA", "#F59E0B",
          "#10B981", "#EF4444", "#8B5CF6", "#EC4899",
        ],
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const doughnutData = {
    labels: attendanceOverview.labels,
    datasets: [
      {
        data: attendanceOverview.data,
        backgroundColor: ["#1ABE17", "#E82646", "#EAB300"],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

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
          <div className="h-[280px]">
            {mounted && (
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: isDark ? "#1e1e2e" : "#fff",
                      titleColor: isDark ? "#fff" : "#000",
                      bodyColor: isDark ? "#ccc" : "#555",
                      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                      borderWidth: 1,
                      cornerRadius: 8,
                      padding: 12,
                    },
                  },
                  scales: {
                    x: {
                      ticks: { color: chartTextColor, font: { size: 11 } },
                      grid: { display: false },
                    },
                    y: {
                      ticks: { color: chartTextColor, font: { size: 11 } },
                      grid: { color: chartGridColor },
                    },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Doughnut chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Attendance Overview</h3>
          <div className="h-[280px] flex items-center justify-center">
            {mounted && (
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "65%",
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        color: chartTextColor,
                        padding: 20,
                        usePointStyle: true,
                        pointStyleWidth: 10,
                        font: { size: 12, weight: 500 as const },
                      },
                    },
                    tooltip: {
                      backgroundColor: isDark ? "#1e1e2e" : "#fff",
                      titleColor: isDark ? "#fff" : "#000",
                      bodyColor: isDark ? "#ccc" : "#555",
                      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                      borderWidth: 1,
                      cornerRadius: 8,
                      padding: 12,
                    },
                  },
                }}
              />
            )}
          </div>
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
