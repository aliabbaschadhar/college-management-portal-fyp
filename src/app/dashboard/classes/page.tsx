"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/axios";
import { BookOpen, Users, ChevronDown, ChevronUp, RefreshCw, Eye, Mail, Phone, Calendar } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ListSkeleton } from "@/components/ui";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DEPARTMENTS } from "@/lib/constants";

interface StudentInCourse {
  id: string;
  rollNo: string;
  phone: string | null;
  department: string;
  semester: number;
  shift: string;
  enrollmentDate?: string;
  user: { name: string | null; email: string };
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
  const [refreshing, setRefreshing] = useState(false);

  // Single-Row Top Filter Bar States
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedSemester, setSelectedSemester] = useState("ALL");
  const [selectedShift, setSelectedShift] = useState("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Student Detail Modal States
  const [selectedStudent, setSelectedStudent] = useState<StudentInCourse | null>(null);
  const [studentModalOpen, setStudentModalOpen] = useState(false);

  const fetchClasses = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const r = await api.get<{ id: string }[]>("/api/courses");
      const list = Array.isArray(r.data) ? r.data : [];
      const detailed = await Promise.all(
        list.map((c) => api.get(`/api/courses/${c.id}`).then((r2) => r2.data))
      );
      setCourses(detailed as CourseWithEnrollments[]);
    } catch (err) {
      console.error("Failed to load classes:", err);
      setCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleRefresh = () => {
    fetchClasses(true);
  };

  // Filter courses by department and semester
  const filteredCourses = courses.filter((c) => {
    if (selectedDept !== "ALL" && c.department !== selectedDept) return false;
    if (selectedSemester !== "ALL" && c.semester !== Number(selectedSemester)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Classes 📚"
          subtitle="Manage your assigned courses and enrolled students"
          breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Classes" }]}
          action={
            <Button variant="outline" size="sm" disabled className="gap-2 rounded-xl">
              <RefreshCw className="h-4 w-4 animate-spin" /> Refresh
            </Button>
          }
        />
        <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-2xl border border-border animate-pulse">
          <div className="h-10 w-[180px] bg-muted rounded-xl border" />
          <div className="h-10 w-[130px] bg-muted rounded-xl border" />
          <div className="h-10 w-[130px] bg-muted rounded-xl border" />
        </div>
        <ListSkeleton count={5} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <PageHeader
        title="My Classes 📚"
        subtitle="Manage your assigned courses and enrolled students"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Classes" }]}
        action={
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2 rounded-xl border-2">
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {/* Single-Row Top Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">Dept:</Label>
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-[180px] h-10 bg-card rounded-xl">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Departments</SelectItem>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">Sem:</Label>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-[130px] h-10 bg-card rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Semesters</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">Shift:</Label>
          <Select value={selectedShift} onValueChange={setSelectedShift}>
            <SelectTrigger className="w-[130px] h-10 bg-card rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Shifts</SelectItem>
              <SelectItem value="Morning">Morning</SelectItem>
              <SelectItem value="Evening">Evening</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.map((course) => {
          const allStudents = course.enrollments?.map((e) => e.student) ?? [];
          const isExpanded = expanded === course.id;

          const filteredStudents = allStudents.filter((s) => {
            if (selectedShift !== "ALL" && s.shift?.toLowerCase() !== selectedShift.toLowerCase()) {
              return false;
            }
            return true;
          });

          return (
            <motion.div key={course.id} layout className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
              {/* Course Row Header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : course.id)}
                className="w-full flex items-center gap-4 p-5 hover:bg-accent/30 transition-colors text-left"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10">
                  <BookOpen className="h-6 w-6 text-brand-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-foreground">
                    {course.courseName}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                    {course.courseCode} • {course.department} • Semester {course.semester}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="secondary" className="gap-1 rounded-lg">
                    <Users className="h-3.5 w-3.5" /> {allStudents.length} Students Enrolled
                  </Badge>
                  <Badge variant="outline" className="text-xs rounded-lg">
                    {course.creditHours} Credits
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Enrolled Students Table */}
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
                      {filteredStudents.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-6 text-center">
                          No enrolled students match the active filters.
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-border bg-card">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-border bg-muted/40 text-left">
                                <th className="py-3 px-4 font-semibold text-muted-foreground w-12">#</th>
                                <th className="py-3 px-4 font-semibold text-muted-foreground">Student Name</th>
                                <th className="py-3 px-4 font-semibold text-muted-foreground">Roll No</th>
                                <th className="py-3 px-4 font-semibold text-muted-foreground">Email</th>
                                <th className="py-3 px-4 font-semibold text-muted-foreground">Shift</th>
                                <th className="py-3 px-4 font-semibold text-muted-foreground text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredStudents.map((s, i) => (
                                <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-accent/20 transition-colors">
                                  <td className="py-3 px-4 text-muted-foreground font-medium">{i + 1}</td>
                                  <td className="py-3 px-4 font-bold text-foreground">{s.user.name ?? "—"}</td>
                                  <td className="py-3 px-4 font-mono text-muted-foreground">{s.rollNo}</td>
                                  <td className="py-3 px-4 text-muted-foreground">{s.user.email}</td>
                                  <td className="py-3 px-4">
                                    <Badge
                                      variant="secondary"
                                      className={
                                        s.shift?.toLowerCase() === "morning"
                                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                          : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                                      }
                                    >
                                      {s.shift ?? "Morning"}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedStudent(s);
                                        setStudentModalOpen(true);
                                      }}
                                      className="h-8 text-xs gap-1 rounded-lg border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white"
                                    >
                                      <Eye className="h-3.5 w-3.5" /> View Details
                                    </Button>
                                  </td>
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

      {filteredCourses.length === 0 && (
        <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-2xl">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium text-foreground">No classes found</p>
          <p className="text-sm mt-1">Try adjusting your department or semester filter.</p>
        </div>
      )}

      {/* Student Details Dialog */}
      <Dialog open={studentModalOpen} onOpenChange={setStudentModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl overflow-hidden border-none shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-brand-primary via-brand-secondary to-brand-primary" />
          <DialogHeader className="pt-6">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-primary" />
              Student Profile Details
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4 py-3">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-lg font-extrabold text-brand-primary">
                  {(selectedStudent.user.name ?? "?")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground">{selectedStudent.user.name ?? "—"}</h4>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">Roll No: {selectedStudent.rollNo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                  <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px] block">Department</span>
                  <span className="font-bold text-foreground">{selectedStudent.department}</span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                  <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px] block">Semester & Shift</span>
                  <span className="font-bold text-foreground">Sem {selectedStudent.semester} ({selectedStudent.shift})</span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border space-y-1 col-span-2">
                  <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email Address
                  </span>
                  <span className="font-bold text-foreground font-mono">{selectedStudent.user.email}</span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                  <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone Number
                  </span>
                  <span className="font-bold text-foreground font-mono">{selectedStudent.phone || "Not Provided"}</span>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border space-y-1">
                  <span className="text-muted-foreground font-medium uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Enrollment Date
                  </span>
                  <span className="font-bold text-foreground font-mono">
                    {selectedStudent.enrollmentDate ? new Date(selectedStudent.enrollmentDate).toLocaleDateString() : "Active"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setStudentModalOpen(false)} className="rounded-xl">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
