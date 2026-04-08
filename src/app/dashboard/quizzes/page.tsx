"use client";

import { useState, useRef, useEffect } from "react";
import { FileText, Plus, Clock, Users, Eye, CheckCircle, Play, Square } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
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

interface ApiCourse {
  id: string;
  courseCode: string;
  courseName: string;
  creditHours: number;
  department: string;
  semester: number;
}

interface ApiQuestion {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  quizId: string | null;
}

interface ApiQuiz {
  id: string;
  title: string;
  courseId: string;
  createdBy: string;
  duration: number;
  totalMarks: number;
  status: "Draft" | "Published" | "Closed";
  dueDate: string;
  _count: { questions: number; attempts: number };
  course: { courseCode: string; courseName: string };
}

const statusColors: Record<string, string> = {
  Draft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  Published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Closed: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

export default function ManageQuizzesPage() {
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [questions, setQuestions] = useState<ApiQuestion[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchQuizzes = async () => {
    const res = await fetch("/api/quizzes");
    if (res.ok) {
      const data: ApiQuiz[] = await res.json();
      setQuizzes(data);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        fetchQuizzes(),
        fetch("/api/courses").then((r) => r.ok ? r.json() : []).then((d: ApiCourse[]) => setCourses(d)),
        fetch("/api/questions").then((r) => r.ok ? r.json() : []).then((d: ApiQuestion[]) => setQuestions(d)),
      ]);
      setLoading(false);
    };
    load();
  }, []);

  const handleStatusToggle = async (quizId: string, newStatus: ApiQuiz["status"]) => {
    const res = await fetch(`/api/quizzes/${quizId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) await fetchQuizzes();
  };

  const handleCreate = async () => {
    if (!formTitle || !formCourse || formQuestions.length === 0 || !formDueDate) return;
    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formTitle,
        courseId: formCourse,
        duration: formDuration,
        totalMarks: formMarks,
        dueDate: formDueDate,
        status: "Draft",
        questionIds: formQuestions,
      }),
    });
    if (res.ok) {
      await fetchQuizzes();
      setShowCreate(false);
      resetForm();
    }
    quizIdCounter.current++;
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

  const courseQuestions = formCourse
    ? questions.filter((q) => !q.quizId)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading quizzes...
      </div>
    );
  }

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
        {quizzes.map((quiz) => (
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
                  {quiz.course?.courseCode} • {quiz._count.questions} questions • {quiz.duration} mins • {quiz.totalMarks} marks
                </p>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Due: {new Date(quiz.dueDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {quiz._count.attempts} attempted
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {quiz.status === "Draft" && (
                  <Button size="sm" variant="outline" onClick={() => handleStatusToggle(quiz.id, "Published")} className="gap-1 text-emerald-600">
                    <Play className="h-3.5 w-3.5" /> Publish
                  </Button>
                )}
                {quiz.status === "Published" && (
                  <Button size="sm" variant="outline" onClick={() => handleStatusToggle(quiz.id, "Closed")} className="gap-1 text-rose-600">
                    <Square className="h-3.5 w-3.5" /> Close
                  </Button>
                )}
                {quiz._count.attempts > 0 && (
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
                    <p className="text-sm text-muted-foreground text-center py-4">Results coming soon.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
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
                    <SelectItem key={c.id} value={c.id}>{c.courseCode} — {c.courseName}</SelectItem>
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
                  <p className="text-xs text-muted-foreground">No unassigned questions available. Add questions in the Question Bank first.</p>
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
