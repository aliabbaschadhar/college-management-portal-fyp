"use client";

import { useState, useRef } from "react";
import { FileText, Plus, Clock, Users, Eye, CheckCircle, Play, Square } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  mockQuizzes,
  mockQuestions,
  mockQuizAttempts,
  mockCourses,
  getFacultyClasses,
  getCourseStudents,
} from "@/lib/mock-data";
import type { Quiz } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const FACULTY_ID = "f1";

const statusColors: Record<string, string> = {
  Draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  Published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Closed: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

export default function ManageQuizzesPage() {
  const courses = getFacultyClasses(FACULTY_ID);
  const facultyQuestions = mockQuestions.filter((q) => q.createdBy === FACULTY_ID);

  const [quizzes, setQuizzes] = useState<Quiz[]>(
    mockQuizzes.filter((q) => q.createdBy === FACULTY_ID)
  );
  const [showCreate, setShowCreate] = useState(false);
  const [showResults, setShowResults] = useState<string | null>(null);
  const quizIdCounter = useRef(0);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formCourse, setFormCourse] = useState("");
  const [formDuration, setFormDuration] = useState(15);
  const [formMarks, setFormMarks] = useState(20);
  const [formQuestions, setFormQuestions] = useState<string[]>([]);
  const [formDueDate, setFormDueDate] = useState("");

  const toggleQuizStatus = (quizId: string, newStatus: Quiz["status"]) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, status: newStatus } : q))
    );
  };

  const handleCreate = () => {
    if (!formTitle || !formCourse || formQuestions.length === 0 || !formDueDate) return;
    const newQuiz: Quiz = {
      id: `qz-new-${++quizIdCounter.current}`,
      title: formTitle,
      courseId: formCourse,
      createdBy: FACULTY_ID,
      duration: formDuration,
      totalMarks: formMarks,
      questions: formQuestions,
      status: "Draft",
      dueDate: formDueDate,
    };
    setQuizzes((prev) => [newQuiz, ...prev]);
    setShowCreate(false);
    resetForm();
  };

  const resetForm = () => {
    setFormTitle("");
    setFormCourse("");
    setFormDuration(15);
    setFormMarks(20);
    setFormQuestions([]);
    setFormDueDate("");
  };

  const toggleQuestion = (qId: string) => {
    setFormQuestions((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const getQuizAttempts = (quizId: string) =>
    mockQuizAttempts.filter((a) => a.quizId === quizId);

  const courseQuestions = formCourse
    ? facultyQuestions.filter((q) => q.courseId === formCourse)
    : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <PageHeader
        title="Manage Quizzes"
        subtitle="Create, publish, and review quiz results"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Quizzes" }]}
        action={
          <Button onClick={() => { resetForm(); setShowCreate(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Create Quiz
          </Button>
        }
      />

      {/* Quiz List */}
      <div className="space-y-4">
        {quizzes.map((quiz) => {
          const course = mockCourses.find((c) => c.id === quiz.courseId);
          const attempts = getQuizAttempts(quiz.id);
          const totalStudents = getCourseStudents(quiz.courseId).length;

          return (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                  <FileText className="h-6 w-6 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-foreground">{quiz.title}</h3>
                    <Badge variant="secondary" className={statusColors[quiz.status]}>{quiz.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {course?.courseCode} • {quiz.questions.length} questions • {quiz.duration} mins • {quiz.totalMarks} marks
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Due: {new Date(quiz.dueDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {attempts.length}/{totalStudents} attempted
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {quiz.status === "Draft" && (
                    <Button size="sm" variant="outline" onClick={() => toggleQuizStatus(quiz.id, "Published")} className="gap-1 text-emerald-600">
                      <Play className="h-3.5 w-3.5" /> Publish
                    </Button>
                  )}
                  {quiz.status === "Published" && (
                    <Button size="sm" variant="outline" onClick={() => toggleQuizStatus(quiz.id, "Closed")} className="gap-1 text-rose-600">
                      <Square className="h-3.5 w-3.5" /> Close
                    </Button>
                  )}
                  {attempts.length > 0 && (
                    <Button size="sm" variant="outline" onClick={() => setShowResults(showResults === quiz.id ? null : quiz.id)} className="gap-1">
                      <Eye className="h-3.5 w-3.5" /> Results
                    </Button>
                  )}
                </div>
              </div>

              {/* Results Dropdown */}
              <AnimatePresence>
                {showResults === quiz.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-border">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Student Results
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border/50">
                              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Student ID</th>
                              <th className="text-center py-2 px-3 font-medium text-muted-foreground">Score</th>
                              <th className="text-center py-2 px-3 font-medium text-muted-foreground">Percentage</th>
                              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Submitted</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attempts.map((att) => {
                              const pct = Math.round((att.score / att.totalMarks) * 100);
                              return (
                                <tr key={att.id} className="border-b border-border/30">
                                  <td className="py-2 px-3 font-mono text-foreground">{att.studentId}</td>
                                  <td className="py-2 px-3 text-center font-semibold text-foreground">
                                    {att.score}/{att.totalMarks}
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <Badge
                                      variant="secondary"
                                      className={pct >= 50 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"}
                                    >
                                      {pct}%
                                    </Badge>
                                  </td>
                                  <td className="py-2 px-3 text-xs text-muted-foreground">
                                    {new Date(att.submittedAt).toLocaleString()}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No quizzes created</p>
          <p className="text-sm mt-1">Click &quot;Create Quiz&quot; to get started.</p>
        </div>
      )}

      {/* Create Quiz Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Quiz Title</label>
              <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Midterm Practice Quiz" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Course</label>
              <Select value={formCourse} onValueChange={(v) => { setFormCourse(v); setFormQuestions([]); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.courseCode} — {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Duration (mins)</label>
                <Input type="number" value={formDuration} onChange={(e) => setFormDuration(+e.target.value)} min={5} max={120} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Total Marks</label>
                <Input type="number" value={formMarks} onChange={(e) => setFormMarks(+e.target.value)} min={1} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Due Date</label>
              <Input type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
            </div>

            {/* Question Selection */}
            {formCourse && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Select Questions ({formQuestions.length} selected)
                </label>
                {courseQuestions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No questions available for this course. Add questions in the Question Bank first.</p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto rounded-lg border border-border p-2">
                    {courseQuestions.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => toggleQuestion(q.id)}
                        className={`w-full text-left rounded-lg p-2.5 text-xs transition-all ${
                          formQuestions.includes(q.id)
                            ? "bg-brand-primary/10 border border-brand-primary/30"
                            : "bg-muted hover:bg-accent/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                            formQuestions.includes(q.id) ? "border-brand-primary bg-brand-primary" : "border-muted-foreground/30"
                          }`}>
                            {formQuestions.includes(q.id) && <CheckCircle className="h-3 w-3 text-white" />}
                          </div>
                          <span className="text-foreground">{q.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formTitle || !formCourse || formQuestions.length === 0 || !formDueDate}>
              Create Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
