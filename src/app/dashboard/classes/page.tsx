"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { BookOpen, Users, ChevronDown, ChevronUp, ArrowLeft, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/ui";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StudentInCourse {
  id: string;
  rollNo: string;
  department: string;
  semester: number;
  shift: string;
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

const departmentIcons: Record<string, string> = {
  "Computer Science": "💻",
  Mathematics: "📐",
  Physics: "⚛️",
  English: "📚",
  Chemistry: "🧪",
  Economics: "📊",
  Urdu: "✍️",
  "Islamic Studies": "🕌",
};

export default function ClassesPage() {
  const [courses, setCourses] = useState<CourseWithEnrollments[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [shiftFilter, setShiftFilter] = useState("morning");

  useEffect(() => {
    api
      .get<{ id: string }[]>("/api/courses")
      .then(async (r) => {
        const list = r.data;
        const detailed = await Promise.all(
          list.map((c) =>
            api.get(`/api/courses/${c.id}`).then((r2) => r2.data),
          ),
        );
        setCourses(detailed as CourseWithEnrollments[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Compute unique departments from assigned courses
  const depts = Array.from(new Set(courses.map((c) => c.department))).sort();

  // Compute unique semesters for selected department
  const semestersForDept = Array.from(
    new Set(
      courses
        .filter((c) => c.department === selectedDept)
        .map((c) => c.semester)
    )
  ).sort((a, b) => a - b);

  // Filter courses by department and semester
  const filteredCourses = courses.filter(
    (c) => c.department === selectedDept && c.semester === Number(selectedSemester)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-muted animate-pulse border-2 border-border" />
          <div className="h-4 w-72 bg-muted animate-pulse border-2 border-border" />
        </div>
        <ListSkeleton count={4} />
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
        title={
          selectedDept === ""
            ? "My Classes"
            : selectedSemester === ""
            ? selectedDept
            : `${selectedDept} — Semester ${selectedSemester}`
        }
        subtitle="View your assigned courses and enrolled students"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          ...(selectedDept === ""
            ? [{ label: "My Classes" }]
            : [
                {
                  label: "My Classes",
                  onClick: () => {
                    setSelectedDept("");
                    setSelectedSemester("");
                  },
                },
                ...(selectedSemester === ""
                  ? [{ label: selectedDept }]
                  : [
                      {
                        label: selectedDept,
                        onClick: () => setSelectedSemester(""),
                      },
                      { label: `Semester ${selectedSemester}` },
                    ]),
              ]),
        ]}
      />

      <AnimatePresence mode="wait">
        {/* VIEW 1: SELECT DEPARTMENT */}
        {selectedDept === "" && (
          <motion.div
            key="departments"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {depts.map((dept) => {
              const deptCount = courses.filter((c) => c.department === dept).length;
              return (
                <Card
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className="group border border-border bg-card hover:bg-accent/40 dark:hover:bg-accent/10 hover:border-brand-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden rounded-xl h-36 flex flex-col justify-between"
                >
                  <CardContent className="p-6 relative h-full flex flex-col justify-between">
                    <div className="absolute top-4 right-4 text-3xl opacity-30 group-hover:opacity-75 group-hover:scale-110 transition-all duration-300">
                      {departmentIcons[dept] || "🎓"}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-brand-primary transition-colors">
                        {dept}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        Department
                      </p>
                    </div>
                    <div className="mt-4">
                      <Badge variant="secondary" className="font-semibold text-xs">
                        {deptCount} Course{deptCount !== 1 ? "s" : ""} Assigned
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {depts.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg font-medium">No classes assigned</p>
              </div>
            )}
          </motion.div>
        )}

        {/* VIEW 2: SELECT ENROLLED SEMESTER */}
        {selectedDept !== "" && selectedSemester === "" && (
          <motion.div
            key="semesters"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setSelectedDept("")}
                className="rounded-xl border-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Departments
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {semestersForDept.map((sem) => {
                const semCount = courses.filter(
                  (c) => c.department === selectedDept && c.semester === sem
                ).length;
                return (
                  <Card
                    key={sem}
                    onClick={() => setSelectedSemester(sem.toString())}
                    className="group border border-border bg-card hover:bg-accent/40 dark:hover:bg-accent/10 hover:border-brand-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden rounded-xl h-36 flex flex-col justify-between"
                  >
                    <CardContent className="p-6 relative h-full flex flex-col justify-between">
                      <div className="absolute top-4 right-4 text-brand-primary opacity-20 group-hover:scale-110 transition-transform duration-300">
                        <GraduationCap className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-brand-primary transition-colors">
                          Semester {sem}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                          Active Class
                        </p>
                      </div>
                      <div className="mt-4">
                        <Badge variant="secondary" className="font-semibold text-xs">
                          {semCount} Course{semCount !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* VIEW 3: COURSES LIST */}
        {selectedDept !== "" && selectedSemester !== "" && (
          <motion.div
            key="courses"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setSelectedSemester("")}
                className="rounded-xl border-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Semesters
              </Button>
            </div>

            <div className="space-y-4">
              {filteredCourses.map((course) => {
                const students = course.enrollments?.map((e) => e.student) ?? [];
                const isExpanded = expanded === course.id;

                // Filtered students by shift selection (default to "morning")
                const filteredStudents = students.filter((s) => {
                  return s.shift?.toLowerCase() === shiftFilter.toLowerCase();
                });

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
                        <h3 className="text-sm font-semibold text-foreground">
                          {course.courseName}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {course.courseCode} • {course.department} • Semester{" "}
                          {course.semester}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="secondary" className="gap-1">
                          <Users className="h-3 w-3" /> {students.length} students
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {course.creditHours} credits
                        </Badge>
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
                          <div className="border-t border-border p-5 space-y-4 bg-muted/10">
                            {students.length === 0 ? (
                              <p className="text-sm text-muted-foreground py-4 text-center">
                                No students enrolled yet.
                              </p>
                            ) : (
                              <>
                                {/* Filters Row */}
                                <div className="flex items-center gap-3 pb-3 border-b border-border/50">
                                  <div className="space-y-1">
                                    <Label className="text-xs font-semibold text-muted-foreground">Shift Filter</Label>
                                    <Select
                                      value={shiftFilter}
                                      onValueChange={(val) => setShiftFilter(val)}
                                    >
                                      <SelectTrigger className="w-[180px] bg-card h-9">
                                        <SelectValue placeholder="Select Shift" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="morning">Morning Shift</SelectItem>
                                        <SelectItem value="evening">Evening Shift</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                {/* Student Table */}
                                {filteredStudents.length === 0 ? (
                                  <p className="text-sm text-muted-foreground py-6 text-center">
                                    No students found in the {shiftFilter} shift.
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto rounded-lg border border-border bg-card">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                          <th className="text-left py-3 px-4 font-semibold text-muted-foreground w-12">
                                            #
                                          </th>
                                          <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                                            Name
                                          </th>
                                          <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                                            Roll No
                                          </th>
                                          <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                                            Shift
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {filteredStudents.map((s, i) => (
                                          <tr
                                            key={s.id}
                                            className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors"
                                          >
                                            <td className="py-3 px-4 text-muted-foreground font-medium">
                                              {i + 1}
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-foreground">
                                              {s.user.name ?? "—"}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-muted-foreground">
                                              {s.rollNo}
                                            </td>
                                            <td className="py-3 px-4">
                                              <Badge
                                                variant="secondary"
                                                className={
                                                  s.shift?.toLowerCase() === "morning"
                                                    ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                                                    : "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
                                                }
                                              >
                                                {s.shift ?? "Morning"}
                                              </Badge>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </>
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
        )}
      </AnimatePresence>
    </motion.div>
  );
}
