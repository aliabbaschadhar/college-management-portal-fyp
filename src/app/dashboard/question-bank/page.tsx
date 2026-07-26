"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Pencil, Trash2, CheckCircle, Loader2, HelpCircle } from "lucide-react";
import { api } from "@/lib/axios";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { ListSkeleton } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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

interface CourseItem {
  id: string;
  courseCode: string;
  courseName: string;
  department: string;
}

interface QuestionItem {
  id: string;
  courseId: string;
  type: "MCQ" | "Short" | "Long";
  text: string;
  options: string[];
  correctOption: number | null;
  sampleAnswer: string | null;
  marks: number;
  quizId: string | null;
  course?: { courseCode: string; courseName: string };
  createdAt: string;
}

const typeBadgeColors: Record<"MCQ" | "Short" | "Long", string> = {
  MCQ: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200",
  Short: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200",
  Long: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200",
};

export default function QuestionBankPage() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [formCourseId, setFormCourseId] = useState("");
  const [formType, setFormType] = useState<"MCQ" | "Short" | "Long">("MCQ");
  const [formText, setFormText] = useState("");
  const [formMarks, setFormMarks] = useState(1);
  const [formOptions, setFormOptions] = useState(["", "", "", ""]);
  const [formCorrect, setFormCorrect] = useState(0);
  const [formSampleAnswer, setFormSampleAnswer] = useState("");

  useEffect(() => {
    Promise.all([
      api.get<CourseItem[]>("/api/courses"),
      api.get<QuestionItem[]>("/api/questions"),
    ])
      .then(([coursesRes, qsRes]) => {
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
        setQuestions(Array.isArray(qsRes.data) ? qsRes.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load question bank data:", err);
        setLoading(false);
      });
  }, []);

  const filteredQuestions = selectedCourseId === "all"
    ? questions
    : questions.filter((q) => q.courseId === selectedCourseId);

  const openAddModal = () => {
    setEditingQuestion(null);
    setFormCourseId(selectedCourseId !== "all" ? selectedCourseId : courses[0]?.id || "");
    setFormType("MCQ");
    setFormText("");
    setFormMarks(1);
    setFormOptions(["", "", "", ""]);
    setFormCorrect(0);
    setFormSampleAnswer("");
    setErrorMsg(null);
    setShowModal(true);
  };

  const openEditModal = (q: QuestionItem) => {
    setEditingQuestion(q);
    setFormCourseId(q.courseId);
    setFormType(q.type);
    setFormText(q.text);
    setFormMarks(q.marks || 1);
    setFormOptions(q.options && q.options.length > 0 ? [...q.options] : ["", "", "", ""]);
    setFormCorrect(q.correctOption ?? 0);
    setFormSampleAnswer(q.sampleAnswer ?? "");
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formText.trim() || !formCourseId) return;
    if (formType === "MCQ" && formOptions.some((o) => !o.trim())) {
      setErrorMsg("Please fill in all 4 option choices for MCQs");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    try {
      const payload = {
        courseId: formCourseId,
        type: formType,
        text: formText,
        marks: Number(formMarks),
        options: formType === "MCQ" ? formOptions : [],
        correctOption: formType === "MCQ" ? formCorrect : null,
        sampleAnswer: formType !== "MCQ" ? formSampleAnswer : null,
      };

      if (editingQuestion) {
        const res = await api.patch<QuestionItem>(`/api/questions/${editingQuestion.id}`, payload);
        const updated = res.data;
        setQuestions((prev) => prev.map((q) => (q.id === updated.id ? { ...q, ...updated } : q)));
      } else {
        const res = await api.post<QuestionItem>("/api/questions", payload);
        const created = res.data;
        setQuestions((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { error?: string } }; message?: string };
      setErrorMsg(apiErr.response?.data?.error || apiErr.message || "Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (qId: string) => {
    setDeletingId(qId);
    try {
      await api.delete(`/api/questions/${qId}`);
      setQuestions((prev) => prev.filter((q) => q.id !== qId));
    } catch {
      // silent fail
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse border-2 border-border" />
            <div className="h-4 w-72 bg-muted animate-pulse border-2 border-border" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-[200px] bg-muted animate-pulse border-2 border-border" />
            <div className="h-10 w-36 bg-muted animate-pulse border-2 border-border" />
          </div>
        </div>
        <ListSkeleton count={5} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <PageHeader
        title="Question Bank"
        subtitle="Create reusable question pools (MCQs, Short & Long questions) for your assigned courses"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Question Bank" }]}
        action={
          <div className="flex items-center gap-3">
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-[220px] rounded-xl">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.courseCode} - {c.courseName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={openAddModal} className="gap-2 bg-brand-primary text-white rounded-xl shadow-md">
              <Plus className="h-4 w-4" /> Add Question
            </Button>
          </div>
        }
      />

      {/* Questions List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredQuestions.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs bg-muted/40">
                      {q.course?.courseCode ?? "Course"}
                    </Badge>
                    <Badge variant="secondary" className={typeBadgeColors[q.type]}>
                      {q.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs font-semibold text-brand-primary border-brand-primary/20">
                      {q.marks} {q.marks === 1 ? "Mark" : "Marks"}
                    </Badge>
                  </div>
                  <p className="text-base font-bold text-foreground leading-snug">{q.text}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(q)} className="h-8 w-8 p-0 rounded-lg" disabled={deletingId !== null}>
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)} className="h-8 w-8 p-0 hover:text-rose-500 rounded-lg" disabled={deletingId === q.id}>
                    {deletingId === q.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* MCQ Options Display */}
              {q.type === "MCQ" && q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs border ${
                        i === q.correctOption
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium"
                          : "bg-muted/30 border-border text-muted-foreground"
                      }`}
                    >
                      <span className="font-bold">{String.fromCharCode(65 + i)}.</span>
                      <span>{opt}</span>
                      {i === q.correctOption && <CheckCircle className="h-3.5 w-3.5 ml-auto shrink-0" />}
                    </div>
                  ))}
                </div>
              )}

              {/* Short/Long Question Sample Answer */}
              {q.type !== "MCQ" && q.sampleAnswer && (
                <div className="p-3 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Answer Key / Rubric: </span>
                  {q.sampleAnswer}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-2xl">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium text-foreground">No questions found</p>
          <p className="text-sm mt-1">Select a course and click &quot;Add Question&quot; to build your question bank.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-brand-primary" />
              {editingQuestion ? "Edit Question" : "Add Question to Bank"}
            </DialogTitle>
          </DialogHeader>

          {errorMsg && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Course</Label>
                <Select value={formCourseId} onValueChange={setFormCourseId}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.courseCode} - {c.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Question Type</Label>
                <Select value={formType} onValueChange={(v) => {
                  const t = v as "MCQ" | "Short" | "Long";
                  setFormType(t);
                  if (t === "Short" && formMarks === 1) setFormMarks(2);
                  if (t === "Long" && formMarks <= 2) setFormMarks(5);
                }}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MCQ">MCQ (Multiple Choice)</SelectItem>
                    <SelectItem value="Short">Short Question</SelectItem>
                    <SelectItem value="Long">Long Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Question Text</Label>
                <Textarea
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Enter question wording..."
                  className="rounded-xl"
                  rows={3}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Marks</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formMarks}
                  onChange={(e) => setFormMarks(Number(e.target.value))}
                  className="h-11 rounded-xl font-mono text-center font-bold"
                />
              </div>
            </div>

            {/* MCQ Options */}
            {formType === "MCQ" && (
              <div className="space-y-2 pt-1">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
                  Options (Click letter to set as correct answer)
                </Label>
                {formOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormCorrect(i)}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 text-xs font-bold transition-all ${
                        formCorrect === i
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                          : "border-muted text-muted-foreground hover:border-emerald-500/50"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </button>
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...formOptions];
                        newOpts[i] = e.target.value;
                        setFormOptions(newOpts);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className="h-10 rounded-xl"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formText.trim() || saving}
              className="bg-brand-primary text-white hover:opacity-90 rounded-xl gap-2 min-w-[100px]"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : editingQuestion ? "Update" : "Save Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
