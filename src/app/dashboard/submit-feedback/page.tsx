"use client";

import { useState } from "react";
import { Star, Send, MessageSquare, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { getStudentCourses, mockFaculty, mockTeaches, mockFeedback } from "@/lib/mock-data";
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

const STUDENT_ID = "s1";

export default function SubmitFeedbackPage() {
  const courses = getStudentCourses(STUDENT_ID);
  const [feedbackType, setFeedbackType] = useState<"Faculty" | "Course">("Faculty");
  const [targetId, setTargetId] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState<string[]>([]);

  // Get faculty for enrolled courses
  const enrolledFaculty = courses
    .map((c) => {
      const teach = mockTeaches.find((t) => t.courseId === c.id);
      return teach ? mockFaculty.find((f) => f.id === teach.facultyId) : null;
    })
    .filter(Boolean)
    .filter((f, i, arr) => arr.findIndex((x) => x?.id === f?.id) === i);

  const alreadySubmitted = (type: string, tId: string) => {
    return (
      mockFeedback.some(
        (f) => f.type === type && f.targetId === tId && f.submittedBy === STUDENT_ID
      ) || submittedFeedbacks.includes(`${type}-${tId}`)
    );
  };

  const handleSubmit = () => {
    if (!targetId || rating === 0) return;
    setSubmittedFeedbacks((prev) => [...prev, `${feedbackType}-${targetId}`]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTargetId("");
      setRating(0);
      setComment("");
    }, 3000);
  };

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
                    {enrolledFaculty.map((f) =>
                      f ? (
                        <SelectItem key={f.id} value={f.id} disabled={alreadySubmitted("Faculty", f.id)}>
                          {f.name} {alreadySubmitted("Faculty", f.id) ? "(Already submitted)" : ""}
                        </SelectItem>
                      ) : null
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Star Rating */}
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

              {/* Comment */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Comment (optional)</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={4}
                />
              </div>

              {/* Submit */}
              {submitted ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Feedback submitted successfully!</span>
                </div>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!targetId || rating === 0 || alreadySubmitted(feedbackType, targetId)}
                  className="w-full gap-2"
                >
                  <Send className="h-4 w-4" /> Submit Feedback
                </Button>
              )}
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
                      <SelectItem key={c.id} value={c.id} disabled={alreadySubmitted("Course", c.id)}>
                        {c.courseCode} — {c.name} {alreadySubmitted("Course", c.id) ? "(Already submitted)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Same star rating UI */}
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

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Comment (optional)</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={4}
                />
              </div>

              {submitted ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Feedback submitted successfully!</span>
                </div>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!targetId || rating === 0 || alreadySubmitted(feedbackType, targetId)}
                  className="w-full gap-2"
                >
                  <Send className="h-4 w-4" /> Submit Feedback
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Previously submitted feedback */}
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Your Past Feedback</h3>
          </div>
          {mockFeedback.filter((f) => f.submittedBy === STUDENT_ID).length === 0 ? (
            <p className="text-sm text-muted-foreground">No feedback submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {mockFeedback
                .filter((f) => f.submittedBy === STUDENT_ID)
                .map((f) => (
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
                      <p className="text-sm text-foreground truncate">{f.comment}</p>
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
