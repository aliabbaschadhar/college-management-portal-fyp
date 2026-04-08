"use client";

import { useState, useEffect, useMemo } from "react";
import { Clock } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { motion } from "framer-motion";

interface TimetableEntry {
  id: string;
  courseId: string;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  course: {
    courseCode: string;
    courseName: string;
    department: string;
    semester: number;
    faculty: { user: { name: string | null } } | null;
  };
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];

const COLOR_PALETTE = [
  { bg: "bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/30" },
  { bg: "bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30" },
  { bg: "bg-purple-500/15", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/30" },
  { bg: "bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30" },
  { bg: "bg-rose-500/15", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/30" },
  { bg: "bg-cyan-500/15", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500/30" },
];

export default function MyTimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/timetable")
      .then((r) => r.json())
      .then((d: TimetableEntry[]) => { setTimetable(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const uniqueCourses = useMemo(() => {
    const seen = new Set<string>();
    return timetable.filter((t) => {
      if (seen.has(t.course.courseCode)) return false;
      seen.add(t.course.courseCode);
      return true;
    });
  }, [timetable]);

  const courseColors = useMemo(() => {
    const map: Record<string, { bg: string; text: string; border: string }> = {};
    uniqueCourses.forEach((t, i) => {
      map[t.course.courseCode] = COLOR_PALETTE[i % COLOR_PALETTE.length];
    });
    return map;
  }, [uniqueCourses]);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = days[new Date().getDay()];

  const getClassForSlot = (day: string, time: string) => {
    return timetable.find((t) => {
      if (t.day !== day) return false;
      const slotHour = parseInt(time.split(":")[0]);
      const startHour = parseInt(t.startTime.split(":")[0]);
      const endHour = parseInt(t.endTime.split(":")[0]);
      return slotHour >= startHour && slotHour < endHour;
    });
  };

  const isCurrentSlot = (day: string, time: string) => {
    if (day !== todayName) return false;
    const now = new Date();
    const slotHour = parseInt(time.split(":")[0]);
    return now.getHours() === slotHour;
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
        title="My Timetable"
        subtitle="Your weekly class schedule"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Timetable" }]}
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {uniqueCourses.map((t) => {
          const colors = courseColors[t.course.courseCode];
          return (
            <div key={t.courseId} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${colors?.bg} border ${colors?.border}`}>
              <div className={`h-2.5 w-2.5 rounded-full ${colors?.bg}`} />
              <span className={`text-xs font-medium ${colors?.text}`}>{t.course.courseCode}</span>
            </div>
          );
        })}
      </div>

      {/* Timetable Grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-3 px-4 font-semibold text-foreground w-20">
                  <Clock className="h-4 w-4" />
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className={`text-center py-3 px-2 font-semibold min-w-[140px] ${
                      day === todayName ? "text-brand-primary bg-brand-primary/5" : "text-foreground"
                    }`}
                  >
                    {day}
                    {day === todayName && (
                      <span className="block text-[10px] font-normal text-brand-primary">Today</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => (
                <tr key={time} className="border-b border-border/50">
                  <td className="py-2 px-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {time}
                  </td>
                  {DAYS.map((day) => {
                    const cls = getClassForSlot(day, time);
                    const isCurrent = isCurrentSlot(day, time);
                    const colors = cls ? courseColors[cls.course.courseCode] : null;

                    if (cls) {
                      const startHour = parseInt(cls.startTime.split(":")[0]);
                      const slotHour = parseInt(time.split(":")[0]);
                      if (slotHour !== startHour) {
                        return null;
                      }
                      const endHour = parseInt(cls.endTime.split(":")[0]);
                      const span = endHour - startHour;

                      return (
                        <td
                          key={day}
                          rowSpan={span}
                          className={`p-1 ${isCurrent ? "ring-2 ring-brand-primary ring-inset" : ""}`}
                        >
                          <div className={`rounded-lg p-2.5 h-full ${colors?.bg} border ${colors?.border} hover:scale-[1.02] transition-transform`}>
                            <p className={`text-xs font-semibold ${colors?.text}`}>{cls.course.courseCode}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{cls.room}</p>
                            <p className="text-[10px] text-muted-foreground">{cls.startTime}–{cls.endTime}</p>
                          </div>
                        </td>
                      );
                    }

                    const coveredClass = timetable.find((t) => {
                      if (t.day !== day) return false;
                      const startH = parseInt(t.startTime.split(":")[0]);
                      const endH = parseInt(t.endTime.split(":")[0]);
                      const slotH = parseInt(time.split(":")[0]);
                      return slotH > startH && slotH < endH;
                    });
                    if (coveredClass) return null;

                    return (
                      <td key={day} className={`p-1 ${isCurrent ? "bg-brand-primary/5" : ""}`}>
                        <div className="h-10" />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
