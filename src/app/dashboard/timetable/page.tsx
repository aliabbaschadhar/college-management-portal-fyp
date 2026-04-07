"use client";

import { useState } from "react";
import { Calendar, Clock, BookOpen, User, MapPin, Sparkles, RefreshCw, Download, Printer } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { mockTimetable, mockCourses, mockFaculty, DEPARTMENTS } from "@/lib/mock-data";
import type { Timetable } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIMES = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<Timetable[]>(mockTimetable);
  const [filterDept, setFilterDept] = useState<string>("Computer Science");
  const [filterSemester, setFilterSemester] = useState<string>("1");
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredTimetable = timetable.filter(
    (t) => t.department === filterDept && t.semester === Number(filterSemester)
  );

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation algorithm
    setTimeout(() => {
      setIsGenerating(false);
      // In a real app, this would call an API or run a client-side algorithm
    }, 2000);
  };

  const getSlot = (day: string, time: string) => {
    return filteredTimetable.find((t) => t.day === day && t.startTime === time);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <PageHeader
        title="Timetable Generator"
        subtitle="Automated scheduling for courses and faculty"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Timetable" }]}
        action={
          <div className="flex items-center gap-2">
             <Button variant="outline" className="h-9 gap-2">
              <Download className="h-4 w-4" /> Export PDF
            </Button>
            <Button 
               onClick={handleGenerate} 
               disabled={isGenerating}
               className="bg-brand-primary hover:bg-brand-primary/90 text-white h-9 shadow-lg shadow-brand-primary/20"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" /> Generate Timetable
                </>
              )}
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 mb-8">
        <div className="flex flex-wrap items-center gap-4 p-4 bg-card border rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Department:</span>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-[200px] bg-transparent border-none focus:ring-0 font-semibold text-brand-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Semester:</span>
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger className="w-[120px] bg-transparent border-none focus:ring-0 font-semibold text-brand-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5,6,7,8].map((s) => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border bg-card shadow-xl p-6">
          <table className="w-full border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="p-3 text-left bg-muted/30 rounded-xl w-[100px]">
                  <Clock className="h-4 w-4 text-muted-foreground mx-auto" />
                </th>
                {DAYS.map((day) => (
                  <th key={day} className="p-3 text-sm font-bold uppercase tracking-widest text-muted-foreground text-center bg-muted/30 rounded-xl min-w-[200px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMES.map((time) => (
                <tr key={time}>
                  <td className="p-4 text-xs font-bold text-muted-foreground text-center bg-muted/10 rounded-xl whitespace-nowrap">
                    {time}
                  </td>
                  {DAYS.map((day) => {
                    const slot = getSlot(day, time);
                    return (
                      <td key={`${day}-${time}`} className="p-0 align-top">
                        <AnimatePresence mode="popLayout">
                          {slot ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="group p-4 bg-brand-primary/5 border-l-4 border-l-brand-primary rounded-xl m-1 hover:bg-brand-primary/10 transition-all duration-300 shadow-sm hover:shadow-md h-full min-h-[100px]"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-tighter">
                                    {slot.courseCode}
                                  </span>
                                  <Badge variant="outline" className="text-[9px] h-4 bg-white/50 backdrop-blur-sm px-1 py-0 border-brand-primary/20">
                                    <MapPin className="h-2 w-2 mr-1" /> {slot.room}
                                  </Badge>
                                </div>
                                <h4 className="text-sm font-bold text-foreground leading-tight line-clamp-2">
                                  {mockCourses.find(c => c.courseCode === slot.courseCode)?.courseName || slot.courseCode}
                                </h4>
                                <div className="flex items-center text-[10px] text-muted-foreground font-medium pt-1">
                                  <User className="h-2.5 w-2.5 mr-1" /> {slot.facultyName}
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            <div className="h-full min-h-[100px] m-1 rounded-xl bg-accent/20 border border-dotted border-muted-foreground/10 flex items-center justify-center group pointer-events-none">
                              <span className="text-[10px] text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity">Free Slot</span>
                            </div>
                          )}
                        </AnimatePresence>
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
