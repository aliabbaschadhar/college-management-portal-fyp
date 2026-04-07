"use client";

import { useState } from "react";
import { Lock, Unlock, Save, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { getFacultyClasses, getCourseStudents, mockGrades } from "@/lib/mock-data";
import type { Grade } from "@/types";
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

const FACULTY_ID = "f1";

export default function FacultyGradesPage() {
  const courses = getFacultyClasses(FACULTY_ID);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [saved, setSaved] = useState(false);

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId);
    setSaved(false);
    const students = getCourseStudents(courseId);
    const existingGrades = students.map((s) => {
      const existing = mockGrades.find((g) => g.studentId === s.id && g.courseId === courseId);
      return existing || {
        id: `new-${s.id}-${courseId}`,
        studentId: s.id,
        courseId,
        quizMarks: 0,
        assignmentMarks: 0,
        midMarks: 0,
        finalMarks: 0,
        total: 0,
        gpa: 0,
        locked: false,
      };
    });
    setGrades(existingGrades);
  };

  const updateGrade = (gradeId: string, field: keyof Grade, value: number) => {
    setGrades((prev) =>
      prev.map((g) => {
        if (g.id !== gradeId || g.locked) return g;
        const updated = { ...g, [field]: value };
        updated.total = updated.quizMarks + updated.assignmentMarks + updated.midMarks + updated.finalMarks;
        // Simple GPA calc: total/max * 4.0
        updated.gpa = +(Math.min(4.0, (updated.total / 150) * 4.0)).toFixed(2);
        return updated;
      })
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const students = selectedCourse ? getCourseStudents(selectedCourse) : [];

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
                  {c.courseCode} — {c.name}
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
                    <th className="text-center py-3 px-3 font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => {
                    const student = students.find((s) => s.id === g.studentId);
                    const gpaColor = g.gpa >= 3.5 ? "text-emerald-500" : g.gpa >= 3.0 ? "text-amber-500" : "text-rose-500";

                    return (
                      <tr key={g.id} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                        <td className="py-3 px-4 font-medium text-foreground">{student?.name}</td>
                        <td className="py-3 px-3 font-mono text-muted-foreground text-xs">{student?.rollNo}</td>
                        <td className="py-2 px-2">
                          <Input
                            type="number"
                            min={0}
                            max={25}
                            value={g.quizMarks}
                            onChange={(e) => updateGrade(g.id, "quizMarks", +e.target.value)}
                            disabled={g.locked}
                            className="text-center h-8 w-16 mx-auto"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            type="number"
                            min={0}
                            max={25}
                            value={g.assignmentMarks}
                            onChange={(e) => updateGrade(g.id, "assignmentMarks", +e.target.value)}
                            disabled={g.locked}
                            className="text-center h-8 w-16 mx-auto"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            value={g.midMarks}
                            onChange={(e) => updateGrade(g.id, "midMarks", +e.target.value)}
                            disabled={g.locked}
                            className="text-center h-8 w-16 mx-auto"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            type="number"
                            min={0}
                            max={50}
                            value={g.finalMarks}
                            onChange={(e) => updateGrade(g.id, "finalMarks", +e.target.value)}
                            disabled={g.locked}
                            className="text-center h-8 w-16 mx-auto"
                          />
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-foreground">{g.total}</td>
                        <td className={`py-3 px-3 text-center font-bold ${gpaColor}`}>{g.gpa}</td>
                        <td className="py-3 px-3 text-center">
                          {g.locked ? (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 gap-1">
                              <Lock className="h-3 w-3" /> Locked
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 gap-1">
                              <Unlock className="h-3 w-3" /> Editable
                            </Badge>
                          )}
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
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" /> Save Grades
              </Button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
