"use client";

import { useState, useEffect } from "react";
import { Star, Send, MessageSquare, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CourseOption {
  id: string;
  courseCode: string;
  courseName: string;
}

interface FacultyOption {
  id: string;
  user: { name: string | null };
  department: string;
}

interface PastFeedback {
  id: string;
  type: "Faculty" | "Course";
  targetId: string;
  rating: number;
  comment: string;
  date: string;
}

export default function SubmitFeedbackPage() {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyOption[]>([]);
  const [pastFeedback, setPastFeedback] = useState<PastFeedback[]>([]);
  const [feedbackType, setFeedbackType] = useState<"Faculty" | "Course">("Faculty");
  const [targetId, setTargetId] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/courses").then((r) => r.json()),
      fetch("/api/faculty").then((r) => r.json()),
      fetch("/api/feedback").then((r) => r.json()),
    ])
      .then(([crs, fac, fb]: [CourseOption[], FacultyOption[], PastFeedback[]]) => {
        setCourses(crs);
        setFacultyList(fac);
        setPastFeedback(fb);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!targetId || rating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: feedbackType, targetId, rating, comment }),
      });
      if (res.ok) {
        const newFeedback: PastFeedback = await res.json();
        setPastFeedback((prev) => [newFeedback, ...prev]);
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setTargetId("");
          setRating(0);
          setComment("");
        }, 3000);
      }
    } catch {
      // silent fail
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = () => (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">Rating</label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoverRating || rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm font-medium text-foreground">
            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
          </span>
        )}
      </div>
    </div>
  );

  const SubmitButton = () =>
    submitted ? (
      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm font-medium">Feedback submitted successfully!</span>
      </div>
    ) : (
      <Button
        onClick={handleSubmit}
        disabled={!targetId || rating === 0 || submitting}
        className="w-full gap-2"
      >
        <Send className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit Feedback"}
      </Button>
    );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <PageHeader
        title="Submit Feedback"
        subtitle="Share your thoughts about courses and faculty"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Feedback" }]}
      />

      <div className="max-w-2xl mx-auto">
        <Tabs value={feedbackType} onValueChange={(v) => { setFeedbackType(v as "Faculty" | "Course"); setTargetId(""); setRating(0); }}>
          <TabsList className="w-full">
            <TabsTrigger value="Faculty" className="flex-1">Faculty Feedback</TabsTrigger>
            <TabsTrigger value="Course" className="flex-1">Course Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="Faculty" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Select Faculty</label>
                <Select value={targetId} onValueChange={setTargetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a faculty member" />
                  </SelectTrigger>
                  <SelectContent>
                    {facultyList.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.user.name} — {f.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <StarRating />
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Comment (optional)</label>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." rows={4} />
              </div>
              <SubmitButton />
            </div>
          </TabsContent>

          <TabsContent value="Course" className="mt-4">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Select Course</label>
                <Select value={targetId} onValueChange={setTargetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.courseCode} — {c.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <StarRating />
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Comment (optional)</label>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." rows={4} />
              </div>
              <SubmitButton />
            </div>
          </TabsContent>
        </Tabs>

        {/* Previously submitted feedback */}
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Recent Feedback</h3>
          </div>
          {pastFeedback.length === 0 ? (
            <p className="text-sm text-muted-foreground">No feedback submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {pastFeedback.slice(0, 5).map((f) => (
                <div key={f.id} className="flex items-center gap-3 rounded-lg p-3 bg-accent/20">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-3.5 w-3.5 ${s <= f.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{f.comment || "No comment"}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{f.type}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
