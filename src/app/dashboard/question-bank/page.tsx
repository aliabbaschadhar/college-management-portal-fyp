"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Pencil, Trash2, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface QuizOption {
  id: string;
  title: string;
  course?: { courseCode: string };
}

interface QuestionWithQuiz {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
  quizId: string;
  quiz?: { title: string; course?: { courseCode: string } };
}

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<QuestionWithQuiz[]>([]);
  const [quizzes, setQuizzes] = useState<QuizOption[]>([]);
  const [filterQuiz, setFilterQuiz] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithQuiz | null>(null);
  const [saving, setSaving] = useState(false);

  const [formText, setFormText] = useState("");
  const [formOptions, setFormOptions] = useState(["", "", "", ""]);
  const [formCorrect, setFormCorrect] = useState(0);
  const [formQuiz, setFormQuiz] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/questions").then((r) => r.json()),
      fetch("/api/quizzes").then((r) => r.json()),
    ])
      .then(([qs, qzs]: [QuestionWithQuiz[], QuizOption[]]) => {
        setQuestions(qs);
        setQuizzes(qzs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filterQuiz === "all"
    ? questions
    : questions.filter((q) => q.quizId === filterQuiz);

  const openAddModal = () => {
    setEditingQuestion(null);
    setFormText("");
    setFormOptions(["", "", "", ""]);
    setFormCorrect(0);
    setFormQuiz(quizzes[0]?.id || "");
    setShowModal(true);
  };

  const openEditModal = (q: QuestionWithQuiz) => {
    setEditingQuestion(q);
    setFormText(q.text);
    setFormOptions([...q.options]);
    setFormCorrect(q.correctOption);
    setFormQuiz(q.quizId);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formText.trim() || formOptions.some((o) => !o.trim()) || !formQuiz) return;
    setSaving(true);
    try {
      if (editingQuestion) {
        const res = await fetch(`/api/questions/${editingQuestion.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: formText, options: formOptions, correctOption: formCorrect }),
        });
        if (res.ok) {
          const updated: QuestionWithQuiz = await res.json();
          setQuestions((prev) => prev.map((q) => (q.id === updated.id ? { ...q, ...updated } : q)));
        }
      } else {
        const res = await fetch("/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: formText, options: formOptions, correctOption: formCorrect, quizId: formQuiz }),
        });
        if (res.ok) {
          const created: QuestionWithQuiz = await res.json();
          setQuestions((prev) => [created, ...prev]);
        }
      }
      setShowModal(false);
    } catch {
      // silent fail
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (qId: string) => {
    try {
      const res = await fetch(`/api/questions/${qId}`, { method: "DELETE" });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== qId));
      }
    } catch {
      // silent fail
    }
  };

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
        title="Question Bank"
        subtitle="Create and manage questions for your quizzes"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Question Bank" }]}
        action={
          <div className="flex items-center gap-3">
            <Select value={filterQuiz} onValueChange={setFilterQuiz}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Quizzes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quizzes</SelectItem>
                {quizzes.map((qz) => (
                  <SelectItem key={qz.id} value={qz.id}>{qz.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={openAddModal} className="gap-2">
              <Plus className="h-4 w-4" /> Add Question
            </Button>
          </div>
        }
      />

      {/* Questions List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {q.quiz?.course?.courseCode ?? q.quiz?.title ?? "Quiz"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Q{idx + 1}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-3">{q.text}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                          i === q.correctOption
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span className="font-bold">{String.fromCharCode(65 + i)}.</span>
                        <span>{opt}</span>
                        {i === q.correctOption && <CheckCircle className="h-3 w-3 ml-auto" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(q)} className="h-8 w-8 p-0">
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)} className="h-8 w-8 p-0 hover:text-rose-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No questions found</p>
          <p className="text-sm mt-1">Click &quot;Add Question&quot; to create your first question.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Quiz</label>
              <Select value={formQuiz} onValueChange={setFormQuiz} disabled={!!editingQuestion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quiz" />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map((qz) => (
                    <SelectItem key={qz.id} value={qz.id}>{qz.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Question Text</label>
              <Textarea
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                placeholder="Enter your question..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground block">Options</label>
              {formOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    onClick={() => setFormCorrect(i)}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                      formCorrect === i
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-muted-foreground/30 text-muted-foreground hover:border-emerald-500/50"
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
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Click the letter to mark it as the correct answer</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!formText.trim() || formOptions.some((o) => !o.trim()) || saving}
            >
              {saving ? "Saving..." : editingQuestion ? "Update" : "Create"} Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
