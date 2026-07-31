"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import {
  Clock,
  User,
  MapPin,
  Download,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  AlertTriangle,
  UserCheck,
  Loader2,
} from "lucide-react";
import { AuditBadgeInline } from "@/components/dashboard/AuditBadge";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { DEPARTMENTS } from "@/lib/constants";
import { TIMETABLE_DAYS } from "@/lib/timetable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TableSkeleton } from "@/components/ui";
import type {
  TimetableApiEntry,
  TimetableDay,
  TimetableMutationInput,
} from "@/types";

interface CourseOption {
  id: string;
  courseCode: string;
  courseName: string;
  department: string;
  semester: number;
  facultyName: string | null;
}

interface FacultyOption {
  id: string;
  name: string;
  department: string;
}

interface TimetableApiError {
  error?: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const EMPTY_FORM: TimetableMutationInput = {
  courseId: "",
  room: "",
  day: "Monday",
  startTime: "07:45",
  endTime: "08:30",
  shift: "Morning",
};

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

function to12HourTime(time: string): string {
  const [hourPart, minutePart] = time.split(":");
  const hours = Number(hourPart);
  const suffix = hours >= 12 ? "PM" : "AM";
  const normalized = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(normalized).padStart(2, "0")}:${minutePart} ${suffix}`;
}

function add45Minutes(time: string, durationMinutes = 45): string {
  const [hours, minutes] = time.split(":").map(Number);
  let nextMinutes = minutes + durationMinutes;
  let nextHours = hours;
  if (nextMinutes >= 60) {
    nextHours = (nextHours + Math.floor(nextMinutes / 60)) % 24;
    nextMinutes = nextMinutes % 60;
  }
  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(2, "0")}`;
}

export default function TimetablePage() {
  const router = useRouter();
  const [timetable, setTimetable] = useState<TimetableApiEntry[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterDept, setFilterDept] = useState<string>("Computer Science");
  const [filterSemester, setFilterSemester] = useState<string>("1");
  const [filterShift, setFilterShift] = useState<string>("Morning");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableApiEntry | null>(
    null,
  );
  const [form, setForm] = useState<TimetableMutationInput>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Dynamic grid configuration states
  const [gridStart, setGridStart] = useState("07:45");
  const [gridDuration, setGridDuration] = useState(45);
  const [gridSlotsCount, setGridSlotsCount] = useState(7);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [deletingTimetableId, setDeletingTimetableId] = useState<string | null>(null);
  const [selectedTimetableIds, setSelectedTimetableIds] = useState<string[]>([]);

  const handleToggleSelectSlot = (id: string) => {
    setSelectedTimetableIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteSlots = async () => {
    if (selectedTimetableIds.length === 0) return;
    setDeletingTimetableId("bulk");
    try {
      await Promise.all(selectedTimetableIds.map((id) => api.delete(`/api/timetable/${id}`)));
      setTimetable((prev) => prev.filter((t) => !selectedTimetableIds.includes(t.id)));
      setSelectedTimetableIds([]);
    } catch (err) {
      console.error("Bulk delete failed:", err);
    } finally {
      setDeletingTimetableId(null);
    }
  };

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

  const loadSettings = useCallback((shift: string) => {
    api
      .get(`/api/timetable/settings?shift=${shift}`)
      .then((res) => {
        if (res.data) {
          setGridStart(res.data.startTime);
          setGridDuration(res.data.duration);
          setGridSlotsCount(res.data.slots);
        }
      })
      .catch((err) => console.error("Error loading timetable settings:", err));
  }, []);

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    setMutationError(null);
    setSettingsSuccess(null);
    try {
      await api.post("/api/timetable/settings", {
        shift: filterShift,
        startTime: gridStart,
        duration: Number(gridDuration),
        slots: Number(gridSlotsCount),
      });
      setSettingsSuccess("Grid configuration saved successfully!");
      setTimeout(() => setSettingsSuccess(null), 4000);
      loadTimetable();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setMutationError(
        axiosErr.response?.data?.error ?? "Failed to save settings"
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  useEffect(() => {
    loadSettings(filterShift);
  }, [filterShift, loadSettings]);


  const loadTimetable = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("department", filterDept);
    params.set("semester", filterSemester);
    params.set("shift", filterShift);

    api
      .get<TimetableApiEntry[]>(`/api/timetable?${params.toString()}`)
      .then((r) => setTimetable(Array.isArray(r.data) ? r.data : []))
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: TimetableApiError } };
        setTimetable([]);
        setError(axiosErr.response?.data?.error ?? "Failed to load timetable");
      })
      .finally(() => setLoading(false));
  }, [filterDept, filterSemester, filterShift]);

  useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  useEffect(() => {
    setCoursesLoading(true);
    api
      .get<unknown>("/api/courses")
      .then((r) => {
        const payload = r.data;
        if (!Array.isArray(payload)) {
          setCourses([]);
          return;
        }

        const mappedCourses = payload
          .map((item) => {
            if (!item || typeof item !== "object") return null;

            const row = item as Record<string, unknown>;
            const id = String(row.id ?? "").trim();
            const courseCode = String(row.courseCode ?? "").trim();
            const courseName = String(row.courseName ?? "").trim();
            const department = String(row.department ?? "").trim();
            const semester = Number(row.semester ?? 0);
            const facultyName =
              typeof row.facultyName === "string" ? row.facultyName : null;

            if (
              !id ||
              !courseCode ||
              !courseName ||
              !department ||
              !Number.isInteger(semester)
            ) {
              return null;
            }

            return {
              id,
              courseCode,
              courseName,
              department,
              semester,
              facultyName,
            } as CourseOption;
          })
          .filter((course): course is CourseOption => Boolean(course));

        setCourses(mappedCourses);
      })
      .catch(() => setCourses([]))
      .finally(() => setCoursesLoading(false));

    api
      .get("/api/faculty")
      .then((r) => {
        if (Array.isArray(r.data)) {
          setFacultyList(
            r.data.map((f: { id: string; user?: { name?: string; email?: string }; department: string }) => ({
              id: f.id,
              name: f.user?.name ?? f.user?.email ?? "Faculty Member",
              department: f.department,
            }))
          );
        }
      })
      .catch(() => setFacultyList([]));
  }, []);

  const [facultyList, setFacultyList] = useState<FacultyOption[]>([]);
  const [selectedTeacherToAssign, setSelectedTeacherToAssign] = useState<string>("");
  const [assigningTeacher, setAssigningTeacher] = useState<boolean>(false);

  // Batch Dialog states
  const [batchDialogOpen, setBatchDialogOpen] = useState<boolean>(false);
  const [batchEntries, setBatchEntries] = useState<{
    courseId: string;
    day: string;
    startTime: string;
    endTime: string;
    room: string;
  }[]>([]);
  const [batchSaving, setBatchSaving] = useState<boolean>(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  const handleAssignTeacher = async (courseId: string, facultyId: string) => {
    if (!courseId || !facultyId) return;
    setAssigningTeacher(true);
    setMutationError(null);
    try {
      await api.patch(`/api/courses/${courseId}`, { assignedFaculty: facultyId });
      const fac = facultyList.find((f) => f.id === facultyId);
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, facultyName: fac?.name ?? "Assigned" } : c))
      );
    } catch {
      setMutationError("Failed to assign teacher to course");
    } finally {
      setAssigningTeacher(false);
    }
  };

  const openBatchDialog = () => {
    const semester = Number(filterSemester);
    const semesterCourses = courses.filter(
      (c) => c.department === filterDept && c.semester === semester
    );

    if (semesterCourses.length === 0) {
      setMutationError(`No courses found for ${filterDept} Semester ${filterSemester}`);
      return;
    }

    const defaultEntries = semesterCourses.map((c, idx) => {
      const startMins = timeToMinutes(gridStart) + idx * gridDuration;
      const startH = Math.floor(startMins / 60) % 24;
      const startM = startMins % 60;
      const startStr = `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`;
      const endStr = add45Minutes(startStr, gridDuration);

      return {
        courseId: c.id,
        day: "Monday",
        startTime: startStr,
        endTime: endStr,
        room: `Room ${101 + idx}`,
      };
    });

    setBatchEntries(defaultEntries);
    setBatchError(null);
    setBatchDialogOpen(true);
  };

  const handleBatchSubmit = async () => {
    setBatchSaving(true);
    setBatchError(null);
    try {
      await api.post("/api/timetable/batch", {
        department: filterDept,
        semester: Number(filterSemester),
        shift: filterShift,
        entries: batchEntries,
      });
      setBatchDialogOpen(false);
      await loadTimetable();
      router.refresh();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setBatchError(axiosErr.response?.data?.error ?? "Failed to create batch schedule");
    } finally {
      setBatchSaving(false);
    }
  };

  const filteredCourses = useMemo(() => {
    const semester = Number(filterSemester);
    const subset = courses.filter(
      (course) =>
        course.department === filterDept && course.semester === semester,
    );
    return subset.length > 0 ? subset : courses;
  }, [courses, filterDept, filterSemester]);

  useEffect(() => {
    if (!form.courseId && filteredCourses.length > 0 && !editingEntry) {
      setForm((current) => ({ ...current, courseId: filteredCourses[0].id }));
    }
  }, [editingEntry, filteredCourses, form.courseId]);

  const openCreateDialog = (day?: TimetableDay, startTime?: string, endTime?: string) => {
    const defaultStart = gridStart;
    const defaultEnd = add45Minutes(gridStart, gridDuration);
    const selectedStart = startTime ?? defaultStart;
    const selectedEnd = endTime ?? (startTime ? add45Minutes(startTime, gridDuration) : defaultEnd);
    const availableCourses =
      filteredCourses.length > 0 ? filteredCourses : courses;

    setEditingEntry(null);
    setMutationError(null);
    setForm({
      ...EMPTY_FORM,
      day: day ?? "Monday",
      startTime: selectedStart,
      endTime: selectedEnd,
      courseId: availableCourses[0]?.id ?? "",
      shift: filterShift,
    });
    setDialogOpen(true);
  };


  const openEditDialog = (entry: TimetableApiEntry) => {
    setEditingEntry(entry);
    setMutationError(null);
    setForm({
      courseId: entry.courseId,
      room: entry.room,
      day: entry.day,
      startTime: entry.startTime,
      endTime: entry.endTime,
      shift: entry.shift,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setMutationError(null);

    try {
      if (editingEntry) {
        await api.patch(`/api/timetable/${editingEntry.id}`, form);
      } else {
        await api.post("/api/timetable", form);
      }
      setDialogOpen(false);
      await loadTimetable();
      router.refresh();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: TimetableApiError } };
      setMutationError(
        axiosErr.response?.data?.error ?? "Failed to save timetable entry",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry: TimetableApiEntry) => {
    setDeletingTimetableId(entry.id);
    setMutationError(null);
    try {
      await api.delete(`/api/timetable/${entry.id}`);
      await loadTimetable();
      router.refresh();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: TimetableApiError } };
      setMutationError(
        axiosErr.response?.data?.error ?? "Failed to delete timetable entry",
      );
    } finally {
      setDeletingTimetableId(null);
    }
  };

  const handleExportPdf = () => {
    setMutationError(null);
    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) {
      setMutationError(
        "Unable to open print window. Please allow pop-ups and try again.",
      );
      return;
    }

    const generatedAt = new Date().toLocaleString();
    const currentSlots = slots;

    const rows = currentSlots.map((slot) => {
      const daySlots = DAYS.map((day) => {
        const slotStart = timeToMinutes(slot.start);
        const slotEnd = timeToMinutes(slot.end);
        const entry = timetable.find((t) => {
          if (t.day !== day) return false;
          const classStart = timeToMinutes(t.startTime);
          const classEnd = timeToMinutes(t.endTime);
          return classStart < slotEnd && classEnd > slotStart;
        });

        if (!entry) return "<td>-</td>";

        return `<td><strong>${entry.course.courseCode}</strong><br/>${entry.course.courseName}<br/>${entry.room}<br/>${entry.course.faculty?.user.name ?? "Unassigned"}</td>`;
      }).join("");

      return `<tr><th>${to12HourTime(slot.start)} - ${to12HourTime(slot.end)}</th>${daySlots}</tr>`;
    }).join("");

    const html = `<!doctype html>
<html>
  <head>
    <title>Timetable ${filterDept} Sem ${filterSemester} (${filterShift})</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
      h1 { margin: 0; font-size: 24px; }
      p { margin: 6px 0; color: #4b5563; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 12px; vertical-align: top; }
      th { background: #f3f4f6; }
      td { min-width: 130px; }
    </style>
  </head>
  <body>
    <h1>Department Timetable</h1>
    <p>Department: ${filterDept}</p>
    <p>Semester: ${filterSemester}</p>
    <p>Shift: ${filterShift}</p>
    <p>Generated: ${generatedAt}</p>
    <table>
      <thead>
        <tr>
          <th>Time</th>
          ${DAYS.map((day) => `<th>${day}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

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

  const isFirstSlotForClass = (cls: TimetableApiEntry, slot: { start: string; end: string }, slotsList: typeof slots) => {
    const classStart = timeToMinutes(cls.startTime);
    const classEnd = timeToMinutes(cls.endTime);
    const firstMatch = slotsList.find((s) => {
      const sStart = timeToMinutes(s.start);
      const sEnd = timeToMinutes(s.end);
      return classStart < sEnd && classEnd > sStart;
    });
    return firstMatch && firstMatch.start === slot.start && firstMatch.end === slot.end;
  };

  const getClassRowSpan = (cls: TimetableApiEntry, slotsList: typeof slots) => {
    const classStart = timeToMinutes(cls.startTime);
    const classEnd = timeToMinutes(cls.endTime);
    return slotsList.filter((s) => {
      const sStart = timeToMinutes(s.start);
      const sEnd = timeToMinutes(s.end);
      return classStart < sEnd && classEnd > sStart;
    }).length;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <PageHeader
        title="Manage Timetable"
        subtitle="Create, edit, and export class schedules"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Timetable" },
        ]}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {selectedTimetableIds.length > 0 && (
              <Button
                variant="destructive"
                className="h-9 gap-2 font-bold animate-pulse"
                onClick={handleBulkDeleteSlots}
                disabled={deletingTimetableId === "bulk"}
              >
                {deletingTimetableId === "bulk" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete Selected ({selectedTimetableIds.length})
              </Button>
            )}
            <Button
              variant="outline"
              className="h-9 gap-2"
              onClick={handleExportPdf}
            >
              <Download className="h-4 w-4" /> Export PDF
            </Button>
            <Button
              onClick={() => openBatchDialog()}
              className="bg-purple-600 hover:bg-purple-700 text-white h-9 shadow-lg shadow-purple-600/20 gap-1.5"
            >
              <Sparkles className="h-4 w-4" /> Batch Generator
            </Button>
            <Button
              onClick={() => openCreateDialog()}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white h-9 shadow-lg shadow-brand-primary/20"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Entry
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 mb-8">
        <div className="flex flex-wrap items-center gap-4 p-4 bg-card border rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Department:
            </span>
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-50 bg-transparent border-none focus:ring-0 font-semibold text-brand-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Semester:
            </span>
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger className="w-30 bg-transparent border-none focus:ring-0 font-semibold text-brand-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                  <SelectItem key={semester} value={String(semester)}>
                    Sem {semester}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Shift:
            </span>
            <Select value={filterShift} onValueChange={setFilterShift}>
              <SelectTrigger className="w-32 bg-transparent border-none focus:ring-0 font-semibold text-brand-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning">Morning</SelectItem>
                <SelectItem value="Evening">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-primary" /> Shift Grid Settings ({filterShift})
            </h3>
            <span className="text-xs text-muted-foreground">Define grid start time, slot duration, and slots count</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Start Time</Label>
              <Input
                type="time"
                value={gridStart}
                onChange={(e) => setGridStart(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Slot Duration (Mins)</Label>
              <Input
                type="number"
                min="5"
                max="180"
                value={gridDuration}
                onChange={(e) => setGridDuration(Number(e.target.value))}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Total Slots</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={gridSlotsCount}
                onChange={(e) => setGridSlotsCount(Number(e.target.value))}
                className="h-9"
              />
            </div>
            <Button
              onClick={handleSaveSettings}
              disabled={settingsSaving}
              size="sm"
              className="bg-brand-primary hover:bg-brand-primary/95 text-white h-9 shadow-sm"
            >
              {settingsSaving ? "Saving..." : "Save Grid Config"}
            </Button>
          </div>
        </div>

        {settingsSuccess && (
          <div className="rounded-lg border border-emerald-250 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
            {settingsSuccess}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {mutationError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {mutationError}
          </div>
        )}

        {loading || coursesLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <div className="overflow-x-auto rounded-3xl border bg-card shadow-xl p-6">
            <table className="w-full border-separate border-spacing-2">
              <thead>
                <tr>
                  <th className="p-3 text-left bg-muted/30 rounded-xl w-25">
                    <Clock className="h-4 w-4 text-muted-foreground mx-auto" />
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="p-3 text-sm font-bold uppercase tracking-widest text-muted-foreground text-center bg-muted/30 rounded-xl min-w-[95px]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={`${slot.start}-${slot.end}`}>
                    <td className="p-4 text-xs font-bold text-muted-foreground text-center bg-muted/10 rounded-xl whitespace-nowrap">
                      {to12HourTime(slot.start)} - {to12HourTime(slot.end)}
                    </td>
                    {DAYS.map((day) => {
                      const cls = getClassForSlot(day, slot);
                      if (cls) {
                        if (!isFirstSlotForClass(cls, slot, slots)) {
                          return null;
                        }
                        const span = getClassRowSpan(cls, slots);

                        return (
                          <td key={day} rowSpan={span} className="p-0 align-top">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="group p-4 bg-brand-primary/5 border-l-4 border-l-brand-primary rounded-xl m-1 hover:bg-brand-primary/10 transition-all duration-300 shadow-sm hover:shadow-md h-full min-h-25"
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-tighter block break-words whitespace-normal">
                                      {cls.course.courseCode}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] h-4 bg-white/50 backdrop-blur-sm px-1 py-0 border-brand-primary/20"
                                    >
                                      <MapPin className="h-2 w-2 mr-1" />{" "}
                                      {cls.room}
                                    </Badge>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="checkbox"
                                      checked={selectedTimetableIds.includes(cls.id)}
                                      onChange={() => handleToggleSelectSlot(cls.id)}
                                      className="h-4 w-4 rounded accent-brand-primary cursor-pointer"
                                      title="Select slot for bulk deletion"
                                    />
                                    <button
                                      onClick={() => openEditDialog(cls)}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-brand-primary/20"
                                      title="Edit entry"
                                    >
                                      <Pencil className="h-3.5 w-3.5 text-brand-primary" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(cls)}
                                      disabled={deletingTimetableId === cls.id}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-rose-100 disabled:opacity-50"
                                      title="Delete entry"
                                    >
                                      {deletingTimetableId === cls.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
                                      ) : (
                                        <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                <h4 className="text-sm font-bold text-foreground leading-tight break-words whitespace-normal">
                                  {cls.course.courseName}
                                </h4>

                                <div className="flex items-center text-[10px] text-muted-foreground font-medium pt-1">
                                  <User className="h-2.5 w-2.5 mr-1" />
                                  {cls.course.faculty?.user.name ??
                                    "Unassigned"}
                                </div>

                                <div className="text-[10px] text-muted-foreground">
                                  {to12HourTime(cls.startTime)} -{" "}
                                  {to12HourTime(cls.endTime)}
                                </div>
                                <AuditBadgeInline
                                  entity="Timetable"
                                  entityId={cls.id}
                                />
                              </div>
                            </motion.div>
                          </td>
                        );
                      }

                      return (
                        <td key={`${day}-${slot.start}`} className="p-0 align-top">
                          <div className="h-full min-h-25 m-1 rounded-xl bg-accent/20 border border-dotted border-muted-foreground/10 flex items-center justify-center group">
                            <button
                              onClick={() =>
                                openCreateDialog(day as TimetableDay, slot.start, slot.end)
                              }
                              className="text-[10px] text-muted-foreground/50 hover:text-brand-primary transition-colors"
                            >
                              + Add Slot
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Edit timetable entry" : "Add timetable entry"}
            </DialogTitle>
            <DialogDescription>
              Assign a course, room, and time slot. Conflict checks run
              automatically.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Course</Label>
              <Select
                value={form.courseId}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, courseId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.courseCode} - {course.courseName} (Sem {course.semester})
                      {(!course.facultyName || course.facultyName === "Unassigned") && " ⚠️ [No Teacher]"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Unassigned Teacher Guard Banner */}
              {(() => {
                const selectedCourse = courses.find((c) => c.id === form.courseId);
                const isUnassigned = !selectedCourse?.facultyName || selectedCourse.facultyName === "Unassigned";
                if (!selectedCourse || !isUnassigned) return null;

                return (
                  <div className="mt-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Subject Unassigned: No teacher assigned to {selectedCourse.courseCode}
                    </div>
                    <p className="text-muted-foreground">
                      Assign a teacher below before finalizing this timetable entry:
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <Select
                        value={selectedTeacherToAssign}
                        onValueChange={setSelectedTeacherToAssign}
                      >
                        <SelectTrigger className="h-9 bg-card text-xs rounded-lg">
                          <SelectValue placeholder="Select Faculty Member..." />
                        </SelectTrigger>
                        <SelectContent>
                          {facultyList.map((fac) => (
                            <SelectItem key={fac.id} value={fac.id}>
                              {fac.name} ({fac.department})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        disabled={!selectedTeacherToAssign || assigningTeacher}
                        onClick={() => handleAssignTeacher(selectedCourse.id, selectedTeacherToAssign)}
                        className="h-9 bg-amber-600 hover:bg-amber-700 text-white text-xs gap-1 rounded-lg shrink-0"
                      >
                        {assigningTeacher ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserCheck className="h-3.5 w-3.5" />}
                        Assign Teacher
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="grid gap-2">
              <Label>Room</Label>
              <Input
                value={form.room}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    room: event.target.value,
                  }))
                }
                placeholder="Room 201"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Day</Label>
                <Select
                  value={form.day}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      day: value as TimetableDay,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMETABLE_DAYS.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Shift</Label>
                <Select
                  value={form.shift}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      shift: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Start</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      startTime: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label>End</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      endTime: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving || (() => {
                const c = courses.find((x) => x.id === form.courseId);
                return !c?.facultyName || c.facultyName === "Unassigned";
              })()}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white"
            >
              {saving
                ? "Saving..."
                : editingEntry
                  ? "Update Entry"
                  : "Add Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Schedule Generator Dialog */}
      <Dialog open={batchDialogOpen} onOpenChange={setBatchDialogOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Batch Schedule Generator — {filterDept} (Sem {filterSemester})
            </DialogTitle>
            <DialogDescription>
              Generate or update class timetable entries for all courses in this semester in a single action.
            </DialogDescription>
          </DialogHeader>

          {batchError && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 font-medium">
              {batchError}
            </div>
          )}

          <div className="space-y-4 py-2">
            <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl flex items-center justify-between">
              <span>Target Shift: <strong className="text-foreground">{filterShift}</strong></span>
              <span>Semester Courses: <strong className="text-foreground">{batchEntries.length}</strong></span>
            </div>

            <div className="space-y-3">
              {batchEntries.map((entry, idx) => {
                const course = courses.find((c) => c.id === entry.courseId);
                const isUnassigned = !course?.facultyName || course.facultyName === "Unassigned";

                return (
                  <div key={entry.courseId} className="p-4 bg-card border border-border rounded-2xl space-y-3 shadow-xs">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{course?.courseCode} - {course?.courseName}</span>
                        {isUnassigned ? (
                          <Badge variant="destructive" className="text-[10px] py-0 px-2 uppercase font-bold">
                            Unassigned Teacher
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 px-2 font-mono text-emerald-600 border-emerald-500/30">
                            {course?.facultyName}
                          </Badge>
                        )}
                      </div>

                      {isUnassigned && (
                        <div className="flex items-center gap-2">
                          <Select
                            value={selectedTeacherToAssign}
                            onValueChange={setSelectedTeacherToAssign}
                          >
                            <SelectTrigger className="h-8 text-xs w-[180px] rounded-lg">
                              <SelectValue placeholder="Assign teacher..." />
                            </SelectTrigger>
                            <SelectContent>
                              {facultyList.map((f) => (
                                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            disabled={!selectedTeacherToAssign || assigningTeacher}
                            onClick={() => handleAssignTeacher(entry.courseId, selectedTeacherToAssign)}
                            className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-lg shrink-0"
                          >
                            Assign
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Day</Label>
                        <Select
                          value={entry.day}
                          onValueChange={(val) => {
                            setBatchEntries((prev) =>
                              prev.map((e, i) => (i === idx ? { ...e, day: val } : e))
                            );
                          }}
                        >
                          <SelectTrigger className="h-9 text-xs rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMETABLE_DAYS.map((d) => (
                              <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Start Time</Label>
                        <Input
                          type="time"
                          value={entry.startTime}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBatchEntries((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? { ...item, startTime: val, endTime: add45Minutes(val, gridDuration) }
                                  : item
                              )
                            );
                          }}
                          className="h-9 text-xs rounded-xl font-mono"
                        />
                      </div>

                      <div>
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">End Time</Label>
                        <Input
                          type="time"
                          value={entry.endTime}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBatchEntries((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, endTime: val } : item))
                            );
                          }}
                          className="h-9 text-xs rounded-xl font-mono"
                        />
                      </div>

                      <div>
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Room</Label>
                        <Input
                          value={entry.room}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBatchEntries((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, room: val } : item))
                            );
                          }}
                          className="h-9 text-xs rounded-xl"
                          placeholder="e.g. Room 101"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button variant="outline" onClick={() => setBatchDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={handleBatchSubmit}
              disabled={batchSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl gap-2 shadow-lg shadow-purple-600/20"
            >
              {batchSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {batchSaving ? "Generating Schedule..." : "Create All Timetable Slots"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
