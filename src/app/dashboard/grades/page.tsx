"use client";

import { useState, useEffect } from "react";
import { Lock, Unlock, Save, CheckCircle, Trash2 } from "lucide-react";
import { AuditBadgeInline } from "@/components/dashboard/AuditBadge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseOption {
  id: string;
  courseCode: string;
  courseName: string;
}

interface GradeEntry {
  id: string;
  studentId: string;
  courseId: string;
  quizMarks: number;
  assignmentMarks: number;
  midMarks: number;
  finalMarks: number;
  total: number;
  gpa: number;
  locked: boolean;
  student: { rollNo: string; user: { name: string | null } };
}

export default function FacultyGradesPage() {
  useUser();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d: CourseOption[]) => setCourses(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSaved(false);
    fetch(`/api/grades?courseId=${courseId}`)
      .then((r) => r.json())
      .then((d: GradeEntry[]) => setGrades(Array.isArray(d) ? d : []))
      .catch(() => setGrades([]));
  };

  const updateGrade = (gradeId: string, field: keyof Pick<GradeEntry, "quizMarks" | "assignmentMarks" | "midMarks" | "finalMarks">, value: number) => {
    setGrades((prev) =>
      prev.map((g) => {
        if (g.id !== gradeId || g.locked) return g;
        const updated = { ...g, [field]: value };
        updated.total = updated.quizMarks + updated.assignmentMarks + updated.midMarks + updated.finalMarks;
        updated.gpa = +(Math.min(4.0, (updated.total / 150) * 4.0)).toFixed(2);
        return updated;
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await Promise.all(
      grades
        .filter((g) => !g.locked)
        .map((g) =>
          fetch("/api/grades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId: g.studentId,
              courseId: g.courseId,
              quizMarks: g.quizMarks,
              assignmentMarks: g.assignmentMarks,
              midMarks: g.midMarks,
              finalMarks: g.finalMarks,
              total: g.total,
              gpa: g.gpa,
            }),
          })
        )
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <PageHeader
        title="Manage Grades"
        subtitle="Enter and update student grades for your courses"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Grades" }]}
        action={
          <Select value={selectedCourse} onValueChange={handleCourseChange}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.courseCode} — {c.courseName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {selectedCourse && grades.length > 0 && (
        <>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Student</th>
                    <th className="text-left py-3 px-3 font-semibold text-foreground">Roll No</th>
                    <th className="text-center py-3 px-2 font-semibold text-foreground w-20">Quiz</th>
                    <th className="text-center py-3 px-2 font-semibold text-foreground w-20">Assignment</th>
                    <th className="text-center py-3 px-2 font-semibold text-foreground w-20">Mid</th>
                    <th className="text-center py-3 px-2 font-semibold text-foreground w-20">Final</th>
                    <th className="text-center py-3 px-3 font-semibold text-foreground">Total</th>
                    <th className="text-center py-3 px-3 font-semibold text-foreground">GPA</th>
                    <th className="text-center py-3 px-3 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => {
                    const gpaColor = g.gpa >= 3.5 ? "text-emerald-500" : g.gpa >= 3.0 ? "text-amber-500" : "text-rose-500";
                    return (
                      <tr key={g.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <span className="font-medium text-foreground">{g.student.user.name ?? "—"}</span>
                            <AuditBadgeInline entity="Grade" entityId={g.id} />
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-muted-foreground text-xs">{g.student.rollNo}</td>
                        <td className="py-2 px-2">
                          <Input type="number" min={0} max={25} value={g.quizMarks} onChange={(e) => updateGrade(g.id, "quizMarks", +e.target.value)} disabled={g.locked} className="text-center h-8 w-16 mx-auto" />
                        </td>
                        <td className="py-2 px-2">
                          <Input type="number" min={0} max={25} value={g.assignmentMarks} onChange={(e) => updateGrade(g.id, "assignmentMarks", +e.target.value)} disabled={g.locked} className="text-center h-8 w-16 mx-auto" />
                        </td>
                        <td className="py-2 px-2">
                          <Input type="number" min={0} max={50} value={g.midMarks} onChange={(e) => updateGrade(g.id, "midMarks", +e.target.value)} disabled={g.locked} className="text-center h-8 w-16 mx-auto" />
                        </td>
                        <td className="py-2 px-2">
                          <Input type="number" min={0} max={50} value={g.finalMarks} onChange={(e) => updateGrade(g.id, "finalMarks", +e.target.value)} disabled={g.locked} className="text-center h-8 w-16 mx-auto" />
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-foreground">{g.total}</td>
                        <td className={`py-3 px-3 text-center font-bold ${gpaColor}`}>{g.gpa}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={async () => {
                                const res = await fetch(`/api/grades/${g.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ locked: !g.locked }),
                                });
                                if (res.ok) setGrades((prev) => prev.map((x) => x.id === g.id ? { ...x, locked: !x.locked } : x));
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
                              title={g.locked ? "Unlock grade" : "Lock grade"}
                            >
                              {g.locked ? (
                                <Lock className="h-3.5 w-3.5 text-emerald-600" />
                              ) : (
                                <Unlock className="h-3.5 w-3.5 text-amber-600" />
                              )}
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Delete grade for ${g.student.user.name}?`)) return;
                                const res = await fetch(`/api/grades/${g.id}`, { method: "DELETE" });
                                if (res.ok) setGrades((prev) => prev.filter((x) => x.id !== g.id));
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-destructive/10 transition-colors"
                              title="Delete grade"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            {saved ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Grades saved successfully!</span>
              </div>
            ) : (
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Grades"}
              </Button>
            )}
          </div>
        </>
      )}

      {selectedCourse && grades.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No grade records found for this course.</p>
        </div>
      )}
    </motion.div>
  );
}
