"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/axios";
import { Clock } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { motion } from "framer-motion";
import { TableSkeleton } from "@/components/ui";

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

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


const COLOR_PALETTE = [
  {
    bg: "bg-blue-500/15",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
  },
  {
    bg: "bg-emerald-500/15",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
  },
  {
    bg: "bg-purple-500/15",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/30",
  },
  {
    bg: "bg-amber-500/15",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
  },
  {
    bg: "bg-rose-500/15",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/30",
  },
  {
    bg: "bg-cyan-500/15",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-500/30",
  },
];

interface StudentProfile {
  department: string;
  semester: number;
  shift: string;
}

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const format12Hour = (timeStr: string) => {
  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${mStr} ${ampm}`;
};

export default function MyTimetablePage() {
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic grid configuration states
  const [gridStart, setGridStart] = useState("07:45");
  const [gridDuration, setGridDuration] = useState(45);
  const [gridSlotsCount, setGridSlotsCount] = useState(7);

  useEffect(() => {
    Promise.all([
      api.get<TimetableEntry[]>("/api/timetable"),
      api.get<{ studentProfile?: StudentProfile }>("/api/dashboard/student").catch(() => null)
    ])
      .then(([ttRes, profileRes]) => {
        const rawTimetable = Array.isArray(ttRes.data) ? ttRes.data : [];
        const filteredTimetable = rawTimetable.filter(
          (t) => t.course?.courseCode?.toUpperCase() !== "CC-411"
        );
        setTimetable(filteredTimetable);
        if (profileRes && profileRes.data && profileRes.data.studentProfile) {
          setStudentProfile(profileRes.data.studentProfile);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!studentProfile) return;
    const shift = studentProfile.shift || "Morning";
    api
      .get(`/api/timetable/settings?shift=${shift}`)
      .then((res) => {
        if (res.data) {
          setGridStart(res.data.startTime);
          setGridDuration(res.data.duration);
          setGridSlotsCount(res.data.slots);
        }
      })
      .catch((err) => console.error("Error fetching student timetable settings:", err));
  }, [studentProfile]);

  const slots = useMemo(() => {
    const list = [];
    if (!gridStart || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(gridStart)) {
      return [];
    }
    let [h, m] = gridStart.split(":").map(Number);
    for (let i = 0; i < gridSlotsCount; i++) {
      const startStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      m += gridDuration;
      if (m >= 60) {
        h += Math.floor(m / 60);
        m = m % 60;
        h = h % 24;
      }
      const endStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      list.push({ start: startStr, end: endStr });
    }
    return list;
  }, [gridStart, gridDuration, gridSlotsCount]);

  const uniqueCourses = useMemo(() => {
    const seen = new Set<string>();
    return timetable.filter((t) => {
      if (seen.has(t.course.courseCode)) return false;
      seen.add(t.course.courseCode);
      return true;
    });
  }, [timetable]);

  const courseColors = useMemo(() => {
    const map: Record<string, { bg: string; text: string; border: string }> =
      {};
    uniqueCourses.forEach((t, i) => {
      map[t.course.courseCode] = COLOR_PALETTE[i % COLOR_PALETTE.length];
    });
    return map;
  }, [uniqueCourses]);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const todayName = days[new Date().getDay()];

  const getClassForSlot = (day: string, slot: { start: string; end: string }) => {
    const slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);
    return timetable.find((t) => {
      if (t.day !== day) return false;
      const classStart = timeToMinutes(t.startTime);
      const classEnd = timeToMinutes(t.endTime);
      return classStart < slotEnd && classEnd > slotStart;
    });
  };

  const isFirstSlotForClass = (cls: TimetableEntry, slot: { start: string; end: string }, slotsList: typeof slots) => {
    const classStart = timeToMinutes(cls.startTime);
    const classEnd = timeToMinutes(cls.endTime);
    const firstMatch = slotsList.find((s) => {
      const sStart = timeToMinutes(s.start);
      const sEnd = timeToMinutes(s.end);
      return classStart < sEnd && classEnd > sStart;
    });
    return firstMatch && firstMatch.start === slot.start && firstMatch.end === slot.end;
  };

  const getClassRowSpan = (cls: TimetableEntry, slotsList: typeof slots) => {
    const classStart = timeToMinutes(cls.startTime);
    const classEnd = timeToMinutes(cls.endTime);
    return slotsList.filter((s) => {
      const sStart = timeToMinutes(s.start);
      const sEnd = timeToMinutes(s.end);
      return classStart < sEnd && classEnd > sStart;
    }).length;
  };

  const isCurrentSlot = (day: string, slot: { start: string; end: string }) => {
    if (day !== todayName) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startM = timeToMinutes(slot.start);
    const endM = timeToMinutes(slot.end);
    return currentMinutes >= startM && currentMinutes < endM;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse border-2 border-border" />
          <div className="h-4 w-56 bg-muted animate-pulse border-2 border-border" />
        </div>
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <PageHeader
        title="My Timetable"
        subtitle="Your weekly class schedule"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Timetable" },
        ]}
      />

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {uniqueCourses.map((t) => {
          const colors = courseColors[t.course.courseCode];
          return (
            <div
              key={t.courseId}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${colors?.bg} border ${colors?.border}`}
            >
              <div className={`h-2.5 w-2.5 rounded-full ${colors?.bg}`} />
              <span className={`text-xs font-medium ${colors?.text}`}>
                {t.course.courseCode} - {t.course.courseName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Timetable Grid */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/55">
                <th className="text-left py-3 px-4 font-semibold text-foreground w-24">
                  <Clock className="h-4 w-4" />
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className={`text-center py-3 px-2 font-semibold min-w-[90px] ${day === todayName
                        ? "text-brand-primary bg-brand-primary/5"
                        : "text-foreground"
                      }`}
                  >
                    {day}
                    {day === todayName && (
                      <span className="block text-[10px] font-normal text-brand-primary">
                        Today
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={`${slot.start}-${slot.end}`} className="border-b border-border/50">
                  <td className="py-3 px-4 text-[10px] sm:text-xs font-mono text-muted-foreground whitespace-nowrap">
                    {format12Hour(slot.start)} - {format12Hour(slot.end)}
                  </td>
                  {DAYS.map((day) => {
                    const cls = getClassForSlot(day, slot);
                    const isCurrent = isCurrentSlot(day, slot);
                    const colors = cls
                      ? courseColors[cls.course.courseCode]
                      : null;

                    if (cls) {
                      if (!isFirstSlotForClass(cls, slot, slots)) {
                        return null;
                      }
                      const span = getClassRowSpan(cls, slots);

                      return (
                        <td
                          key={day}
                          rowSpan={span}
                          className={`p-1 ${isCurrent ? "ring-2 ring-brand-primary ring-inset" : ""}`}
                        >
                          <div
                            className={`rounded-lg p-2.5 h-full ${colors?.bg} border ${colors?.border} hover:scale-[1.02] transition-transform flex flex-col justify-between`}
                          >
                            <div>
                              <p
                                className={`text-xs font-bold ${colors?.text} leading-tight break-words whitespace-normal`}
                                title={cls.course.courseCode}
                              >
                                {cls.course.courseCode}
                              </p>
                              <p
                                className="text-[10px] text-foreground/90 font-medium break-words whitespace-normal mt-0.5"
                                title={cls.course.courseName}
                              >
                                {cls.course.courseName}
                              </p>
                              <p className="text-[10px] text-foreground/80 mt-1 font-medium">
                                Room: {cls.room}
                              </p>
                              <p className="text-[10px] text-muted-foreground font-medium">
                                Teacher: {cls.course.faculty?.user.name || "Not assigned"}
                              </p>
                            </div>
                            <p className="text-[9px] text-muted-foreground/85 mt-2 font-mono">
                              {format12Hour(cls.startTime)}–{format12Hour(cls.endTime)}
                            </p>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={day}
                        className={`p-1 ${isCurrent ? "bg-brand-primary/5" : ""}`}
                      >
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
