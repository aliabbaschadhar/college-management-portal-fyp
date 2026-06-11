"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { BookOpen, Users, Clock, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { GridSkeleton } from "@/components/ui";

interface CourseWithDetails {
  id: string;
  courseCode: string;
  courseName: string;
  creditHours: number;
  department: string;
  semester: number;
  assignedFaculty: string | null;
  faculty: { user: { name: string | null } } | null;
  _count: { enrollments: number };
}

const COURSE_COLORS = [
  "from-blue-500/10 to-indigo-500/10 border-blue-500/20",
  "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
  "from-purple-500/10 to-violet-500/10 border-purple-500/20",
  "from-amber-500/10 to-orange-500/10 border-amber-500/20",
  "from-rose-500/10 to-pink-500/10 border-rose-500/20",
  "from-cyan-500/10 to-sky-500/10 border-cyan-500/20",
];

const ICON_COLORS = [
  "var(--color-brand-primary)",
  "var(--color-system-success)",
  "var(--color-data-3)",
  "var(--color-data-4)",
  "var(--color-system-danger)",
  "var(--color-brand-secondary)",
];

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<CourseWithDetails[]>("/api/courses")
      .then((r) => {
        setCourses(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-muted animate-pulse border-2 border-border" />
          <div className="h-4 w-64 bg-muted animate-pulse border-2 border-border" />
        </div>
        <GridSkeleton count={6} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <PageHeader
        title="My Courses"
        subtitle="View your enrolled courses and their details"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "My Courses" },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
        {courses.map((course, idx) => {
          const facultyName = course.faculty?.user?.name ?? "TBA";
          const studentCount = course._count.enrollments;

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`group relative rounded-2xl border-2 border-border/60 bg-linear-to-br ${COURSE_COLORS[idx % COURSE_COLORS.length]} p-5 hover:shadow-xl hover:shadow-brand-primary/5 hover:-translate-y-1 transition-all duration-300`}
            >
              {/* Course Icon */}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl mb-4 border border-border/20 shadow-sm"
                style={{
                  backgroundColor: `color-mix(in oklab, ${ICON_COLORS[idx % ICON_COLORS.length]} 20%, transparent)`,
                }}
              >
                <BookOpen
                  className="h-6 w-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: ICON_COLORS[idx % ICON_COLORS.length] }}
                />
              </div>

              {/* Course Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-base font-semibold text-foreground leading-snug group-hover:text-brand-primary transition-colors line-clamp-2 pr-12">
                    {course.courseName}
                  </h3>
                </div>

                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {course.department}
                </p>

                <div className="h-px bg-border/40 my-2" />

                <div className="flex flex-col gap-2 pt-1">
                  <div className="flex items-center gap-2 text-xs text-foreground/80 font-medium">
                    <GraduationCap className="h-4 w-4 text-brand-primary shrink-0" />
                    <span className="truncate">Faculty: {facultyName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground/80 font-medium">
                    <Users className="h-4 w-4 text-brand-secondary shrink-0" />
                    <span>Enrolled: {studentCount} students</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground/80 font-medium">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span>Credit Hours: {course.creditHours} Credits</span>
                  </div>
                </div>
              </div>

              {/* Top-Right Badges */}
              <div className="absolute top-5 right-5 flex flex-col items-end gap-1.5">
                <Badge
                  variant="secondary"
                  className="shrink-0 text-[10px] font-bold border border-border bg-card py-0.5 px-1.5"
                >
                  {course.courseCode}
                </Badge>
                <Badge variant="outline" className="text-[10px] font-semibold bg-card border border-border py-0.5 px-1.5">
                  Sem {course.semester}
                </Badge>
              </div>
            </motion.div>
          );
        })}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No courses enrolled</p>
          <p className="text-sm mt-1">
            Contact your department for course registration.
          </p>
        </div>
      )}
    </motion.div>
  );
}
