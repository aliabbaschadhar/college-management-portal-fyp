"use client";

import { useState, useEffect, useCallback } from "react";
import { FileText, Clock, ArrowRight, Trophy, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctOption: number;
}

interface QuizWithDetails {
  id: string;
  title: string;
  courseId: string;
  createdBy: string;
  duration: number;
  totalMarks: number;
  status: "Draft" | "Published" | "Closed";
  dueDate: string;
  questions: QuizQuestion[];
  course?: { courseCode: string; courseName: string };
}

type QuizView = "list" | "attempt" | "result";

export default function TakeQuizPage() {
  const [quizzes, setQuizzes] = useState<QuizWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<QuizView>("list");
  const [activeQuiz, setActiveQuiz] = useState<QuizWithDetails | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch("/api/quizzes?status=Published")
      .then((r) => r.json())
      .then((d: QuizWithDetails[]) => { setQuizzes(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const startQuiz = useCallback(async (quiz: QuizWithDetails) => {
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}`);
      const fullQuiz: QuizWithDetails = await res.json();
      setActiveQuiz(fullQuiz);
      setQuestions(fullQuiz.questions || []);
      setCurrentQ(0);
      setAnswers(new Array((fullQuiz.questions || []).length).fill(null));
      setTimeLeft(fullQuiz.duration * 60);
      setView("attempt");
    } catch {
      // silent fail
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (view !== "attempt" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [view, timeLeft]);

  useEffect(() => {
    if (view === "attempt" && timeLeft === 0 && activeQuiz) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, view]);

  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctOption) correct++;
    });
    const totalMarks = activeQuiz?.totalMarks || 0;
    const marksPerQ = questions.length > 0 ? totalMarks / questions.length : 0;
    setScore(Math.round(correct * marksPerQ));
    setView("result");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // ─── LIST VIEW ───────────────────────────────────────────
  if (view === "list") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
        <PageHeader
          title="Take Quiz"
          subtitle="View available quizzes and past attempts"
          breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Take Quiz" }]}
        />

        <div className="space-y-4">
          {quizzes.filter((q) => q.status === "Published").map((quiz) => {
            const daysLeft = Math.ceil(
              (new Date(quiz.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );

            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                  <FileText className="h-6 w-6 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">{quiz.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {quiz.course?.courseCode} • {quiz.questions?.length || 0} questions • {quiz.duration} mins • {quiz.totalMarks} marks
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Due: {new Date(quiz.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    variant="secondary"
                    className={
                      daysLeft <= 2
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }
                  >
                    {daysLeft}d left
                  </Badge>
                  <Button size="sm" onClick={() => startQuiz(quiz)} className="gap-1">
                    Start <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
          {quizzes.filter((q) => q.status === "Published").length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">No quizzes available</p>
              <p className="text-sm mt-1">Check back later for new quizzes.</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // ─── ATTEMPT VIEW ────────────────────────────────────────
  if (view === "attempt" && activeQuiz) {
    const q = questions[currentQ];
    const answeredCount = answers.filter((a) => a !== null).length;
    const isTimeLow = timeLeft <= 60;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Quiz Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">{activeQuiz.title}</h2>
            <p className="text-sm text-muted-foreground">
              Question {currentQ + 1} of {questions.length} • {answeredCount}/{questions.length} answered
            </p>
          </div>
          <div className={`flex items-center gap-2 rounded-xl px-4 py-2 border ${isTimeLow ? "border-rose-500/50 bg-rose-500/10" : "border-border bg-card"}`}>
            <Clock className={`h-5 w-5 ${isTimeLow ? "text-rose-500 animate-pulse" : "text-muted-foreground"}`} />
            <span className={`text-xl font-mono font-bold ${isTimeLow ? "text-rose-500" : "text-foreground"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Question Area */}
          <div className="lg:col-span-3 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <p className="text-base font-medium text-foreground mb-6">
                  <span className="text-brand-primary font-bold mr-2">Q{currentQ + 1}.</span>
                  {q?.text}
                </p>
                <div className="space-y-3">
                  {q?.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className={`w-full text-left rounded-xl border p-4 transition-all duration-200 ${answers[currentQ] === idx
                          ? "border-brand-primary bg-brand-primary/10 ring-1 ring-brand-primary/30"
                          : "border-border bg-card hover:border-brand-primary/30 hover:bg-accent/30"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${answers[currentQ] === idx
                              ? "border-brand-primary bg-brand-primary text-white"
                              : "border-muted-foreground/30 text-muted-foreground"
                            }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span className="text-sm text-foreground">{opt}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentQ((p) => Math.max(0, p - 1))} disabled={currentQ === 0}>
                Previous
              </Button>
              {currentQ < questions.length - 1 ? (
                <Button onClick={() => setCurrentQ((p) => p + 1)}>
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>

          {/* Question Navigation Grid */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Questions</h3>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`h-10 w-10 rounded-lg text-xs font-bold transition-all ${i === currentQ
                      ? "bg-brand-primary text-white ring-2 ring-brand-primary/30"
                      : answers[i] !== null
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-brand-primary" /><span className="text-muted-foreground">Current</span></div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500/30" /><span className="text-muted-foreground">Answered</span></div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-muted" /><span className="text-muted-foreground">Not answered</span></div>
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <Button variant="outline" size="sm" className="w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20" onClick={handleSubmit}>
                <AlertCircle className="h-3.5 w-3.5 mr-1" /> End Quiz
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── RESULT VIEW ─────────────────────────────────────────
  if (view === "result" && activeQuiz) {
    const totalMarks = activeQuiz.totalMarks;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const isPassing = percentage >= 50;

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto space-y-6 mt-8">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className={`flex h-20 w-20 mx-auto items-center justify-center rounded-2xl ${isPassing ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
            <Trophy className={`h-10 w-10 ${isPassing ? "text-emerald-500" : "text-rose-500"}`} />
          </div>
          <h2 className="text-xl font-bold text-foreground mt-4">{isPassing ? "Great Job! 🎉" : "Keep Trying! 💪"}</h2>
          <p className="text-sm text-muted-foreground mt-1">{activeQuiz.title}</p>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-muted/50 p-3"><p className="text-2xl font-bold text-foreground">{score}</p><p className="text-xs text-muted-foreground">Score</p></div>
            <div className="rounded-xl bg-muted/50 p-3"><p className="text-2xl font-bold text-foreground">{totalMarks}</p><p className="text-xs text-muted-foreground">Total</p></div>
            <div className="rounded-xl bg-muted/50 p-3"><p className={`text-2xl font-bold ${isPassing ? "text-emerald-500" : "text-rose-500"}`}>{percentage}%</p><p className="text-xs text-muted-foreground">Percentage</p></div>
          </div>
          <Button className="mt-6" onClick={() => { setView("list"); setActiveQuiz(null); }}>Back to Quizzes</Button>
        </div>
      </motion.div>
    );
  }

  return null;
}
