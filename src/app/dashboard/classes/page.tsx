"use client";

import { useState } from "react";
import { BookOpen, Users, ChevronDown, ChevronUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { getFacultyClasses, getCourseStudents } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const FACULTY_ID = "f1";

export default function ClassesPage() {
  const courses = getFacultyClasses(FACULTY_ID);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <PageHeader
        title="My Classes"
        subtitle="View your assigned courses and enrolled students"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Classes" }]}
      />

      <div className="space-y-4">
        {courses.map((course) => {
          const students = getCourseStudents(course.id);
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
                  <h3 className="text-sm font-semibold text-foreground">{course.name}</h3>
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
                                  <td className="py-2.5 px-3 font-medium text-foreground">{s.name}</td>
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
      </div>
    </motion.div>
  );
}
