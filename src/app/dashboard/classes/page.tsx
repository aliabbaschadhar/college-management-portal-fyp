"use client";

import { useState, useEffect } from "react";
import { BookOpen, Users, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface StudentInCourse {
  id: string;
  rollNo: string;
  department: string;
  semester: number;
  user: { name: string | null };
}

interface CourseWithEnrollments {
  id: string;
  courseCode: string;
  courseName: string;
  creditHours: number;
  department: string;
  semester: number;
  enrollments: { student: StudentInCourse }[];
}

export default function ClassesPage() {
  const [courses, setCourses] = useState<CourseWithEnrollments[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    // Fetch each course with its enrollments via /api/courses/[id]
    fetch("/api/courses")
      .then((r) => r.json())
      .then(async (list: { id: string }[]) => {
        const detailed = await Promise.all(
          list.map((c) => fetch(`/api/courses/${c.id}`).then((r) => r.json()))
        );
        setCourses(detailed as CourseWithEnrollments[]);
        setLoading(false);
      })
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <PageHeader
        title="My Classes"
        subtitle="View your assigned courses and enrolled students"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Classes" }]}
      />

      <div className="space-y-4">
        {courses.map((course) => {
          const students = course.enrollments?.map((e) => e.student) ?? [];
          const isExpanded = expanded === course.id;

          return (
            <motion.div
              key={course.id}
              layout
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              {/* Course Header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : course.id)}
                className="w-full flex items-center gap-4 p-5 hover:bg-accent/30 transition-colors text-left"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
                  <BookOpen className="h-6 w-6 text-brand-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{course.courseName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {course.courseCode} • {course.department} • Semester {course.semester}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="secondary" className="gap-1">
                    <Users className="h-3 w-3" /> {students.length} students
                  </Badge>
                  <Badge variant="outline" className="text-xs">{course.creditHours} credits</Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Student List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border p-4">
                      {students.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">No students enrolled yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border/50">
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground">#</th>
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Roll No</th>
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Department</th>
                                <th className="text-left py-2 px-3 font-medium text-muted-foreground">Semester</th>
                              </tr>
                            </thead>
                            <tbody>
                              {students.map((s, i) => (
                                <tr key={s.id} className="border-b border-border/30 hover:bg-accent/20 transition-colors">
                                  <td className="py-2.5 px-3 text-muted-foreground">{i + 1}</td>
                                  <td className="py-2.5 px-3 font-medium text-foreground">{s.user.name ?? "—"}</td>
                                  <td className="py-2.5 px-3 font-mono text-muted-foreground">{s.rollNo}</td>
                                  <td className="py-2.5 px-3 text-muted-foreground">{s.department}</td>
                                  <td className="py-2.5 px-3 text-muted-foreground">Sem {s.semester}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        {courses.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No classes assigned</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
