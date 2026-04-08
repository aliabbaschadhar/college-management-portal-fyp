"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";

interface FeedbackItem {
  id: string;
  type: "Faculty" | "Course";
  targetId: string;
  rating: number;
  comment: string;
  date: string;
}

const STAR_COLORS = ["#E82646", "#F97316", "#EAB300", "#84CC16", "#1ABE17"];

export default function FacultyFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feedback")
      .then((r) => r.json())
      .then((d: FeedbackItem[]) => { setFeedback(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const avgRating = feedback.length > 0
    ? +(feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
    : 0;

  const totalReviews = feedback.length;
  const fiveStarCount = feedback.filter((f) => f.rating === 5).length;

  // Distribution chart
  const distributionData = [1, 2, 3, 4, 5].map((star) => ({
    star: `${star} ★`,
    count: feedback.filter((f) => f.rating === star).length,
    fill: STAR_COLORS[star - 1],
  }));

  const distributionConfig: ChartConfig = Object.fromEntries(
    [1, 2, 3, 4, 5].map((s) => [
      `${s} ★`,
      { label: `${s} Star`, color: STAR_COLORS[s - 1] },
    ])
  );

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
        title="My Feedback"
        subtitle="View student feedback and ratings"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Feedback" }]}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Average Rating"
          value={`${avgRating}/5`}
          trend={avgRating >= 4 ? "Excellent" : "Good"}
          trendDirection="up"
          icon={Star}
          iconColor="#F59E0B"
          iconBg="rgba(245,158,11,0.1)"
        />
        <StatsCard
          title="Total Reviews"
          value={totalReviews}
          trend="All time"
          trendDirection="up"
          icon={MessageSquare}
          iconColor="#3D5EE1"
          iconBg="rgba(61,94,225,0.1)"
        />
        <StatsCard
          title="5-Star Reviews"
          value={fiveStarCount}
          trend={`${totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 0}%`}
          trendDirection="up"
          icon={TrendingUp}
          iconColor="#1ABE17"
          iconBg="rgba(26,190,23,0.1)"
        />
      </div>

      {/* Rating Distribution Chart */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Rating Distribution</h3>
        <ChartContainer config={distributionConfig} className="min-h-[240px] w-full">
          <BarChart accessibilityLayer data={distributionData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="star" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {distributionData.map((entry, idx) => (
                <Cell key={idx} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      {/* Big Rating Card */}
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="flex items-center justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-8 w-8 ${s <= Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
            />
          ))}
        </div>
        <p className="text-4xl font-bold text-foreground">{avgRating}</p>
        <p className="text-sm text-muted-foreground mt-1">Based on {totalReviews} reviews</p>
      </div>

      {/* Feedback List */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Feedback</h3>
        <div className="space-y-3">
          {feedback.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No feedback received yet.</p>
          ) : (
            feedback.map((f) => {
              const student = mockStudents.find((s) => s.id === f.submittedBy);
              return (
                <div
                  key={f.id}
                  className="flex items-start gap-4 rounded-lg p-4 bg-accent/20 hover:bg-accent/40 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-bold text-brand-primary">
                    {student?.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">{student?.name || "Anonymous"}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-3.5 w-3.5 ${s <= f.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{f.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(f.date).toLocaleDateString()} •{" "}
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{f.type}</Badge>
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
