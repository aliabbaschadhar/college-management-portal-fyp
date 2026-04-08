"use client";

import { useState, useEffect } from "react";
import { BookOpen, Users, Clock, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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

const ICON_COLORS = ["#3D5EE1", "#1ABE17", "#A78BFA", "#F59E0B", "#E82646", "#6FCCD8"];

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<CourseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d: CourseWithDetails[]) => { setCourses(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <PageHeader
        title="My Courses"
        subtitle="View your enrolled courses and their details"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Courses" }]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
        {courses.map((course, idx) => {
          const facultyName = course.faculty?.user?.name ?? "TBA";
          const studentCount = course._count.enrollments;

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`group relative rounded-xl border bg-linear-to-br ${COURSE_COLORS[idx % COURSE_COLORS.length]} p-5 hover:shadow-lg hover:shadow-brand-primary/5 transition-all duration-300`}
            >
              {/* Course Icon */}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
                style={{ backgroundColor: `${ICON_COLORS[idx % ICON_COLORS.length]}15` }}
              >
                <BookOpen className="h-6 w-6" style={{ color: ICON_COLORS[idx % ICON_COLORS.length] }} />
              </div>

              {/* Course Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-foreground leading-tight">{course.courseName}</h3>
                  <Badge variant="secondary" className="shrink-0 text-xs font-mono">
                    {course.courseCode}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">{course.department}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{facultyName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span>{studentCount} students</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{course.creditHours} credit hrs</span>
                  </div>
                </div>
              </div>

              {/* Semester Badge */}
              <div className="absolute top-4 right-4">
                <Badge variant="outline" className="text-[10px]">
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
          <p className="text-sm mt-1">Contact your department for course registration.</p>
        </div>
      )}
    </motion.div>
  );
}
