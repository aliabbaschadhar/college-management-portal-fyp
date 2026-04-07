"use client";

import { useState } from "react";
import { Star, MessageSquare, User, BookOpen, Trash2, Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { mockFeedback, mockFaculty, mockCourses } from "@/lib/mock-data";
import type { Feedback } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(mockFeedback);
  const [filterRating, setFilterRating] = useState<string>("all");

  const filtered = filterRating === "all" 
    ? feedbacks 
    : feedbacks.filter((f) => f.rating === Number(filterRating));

  const handleDelete = (id: string) => {
    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
  };

  const columns: Column<Feedback>[] = [
    { key: "studentId", header: "Student", sortable: true, render: (row) => (
      <span className="text-xs font-mono text-muted-foreground uppercase">{row.studentId}</span>
    )},
    { key: "type", header: "Feedback on", sortable: true, render: (row) => {
      const isFaculty = row.type === "Faculty";
      const targetName = isFaculty 
        ? mockFaculty.find(f => f.id === row.targetId)?.name 
        : mockCourses.find(c => c.id === row.targetId)?.courseName;
      
      return (
        <div className="flex flex-col gap-0.5">
          <Badge variant="secondary" className="w-fit text-[10px] h-4 mb-1">
             {row.type}
          </Badge>
          <span className="text-sm font-medium">{targetName || row.targetId}</span>
        </div>
      );
    }},
    { key: "rating", header: "Rating", sortable: true, render: (row) => (
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold text-brand-primary">{row.rating}</span>
        <div className="flex">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className={`h-3 w-3 ${s <= row.rating ? "fill-brand-secondary text-brand-secondary" : "text-muted-foreground/30"}`} />
          ))}
        </div>
      </div>
    )},
    { key: "comment", header: "Message", render: (row) => (
      <p className="text-xs text-muted-foreground max-w-[300px] line-clamp-2 italic leading-relaxed">
        "{row.comment}"
      </p>
    )},
    { key: "date", header: "Date", sortable: true, render: (row) => (
      <span className="text-[10px] font-mono text-muted-foreground">
        {new Date(row.date).toLocaleDateString()}
      </span>
    )},
    { key: "actions", header: "Actions", render: (row) => (
      <button 
        onClick={() => handleDelete(row.id)}
        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
        title="Delete feedback"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <PageHeader
        title="Student Feedback"
        subtitle="Review community sentiment for courses and faculty"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Feedback" }]}
        action={
          <div className="flex items-center gap-3">
             <Select value={filterRating} onValueChange={setFilterRating}>
               <SelectTrigger className="w-[160px] h-9">
                 <SelectValue placeholder="All Ratings" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
               </SelectContent>
             </Select>
          </div>
        }
      />

      <div className="bg-card/50 backdrop-blur-md border rounded-3xl overflow-hidden shadow-xl ring-1 ring-brand-primary/5">
        <DataTable
          data={filtered as unknown as Record<string, unknown>[]}
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          searchPlaceholder="Search by student or comment..."
          searchKeys={["studentId", "comment"]}
        />
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {[
          { label: "Avg Rating", value: (feedbacks.reduce((a,b) => a+b.rating, 0)/feedbacks.length).toFixed(1), icon: Star, color: "text-brand-secondary" },
          { label: "Total Reviews", value: feedbacks.length, icon: MessageSquare, color: "text-brand-primary" },
          { label: "Course Satisfaction", value: "88%", icon: BookOpen, color: "text-emerald-500" },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="p-6 bg-card border rounded-2xl flex items-center gap-4 shadow-sm"
          >
            <div className={`p-3 rounded-xl bg-muted/40 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <h4 className="text-2xl font-black">{stat.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
