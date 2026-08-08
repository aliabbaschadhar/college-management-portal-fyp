import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hasTimeOverlap, TIMETABLE_DAYS } from "@/lib/timetable";
import { logAuditAction, getAdminName } from "@/lib/audit-log";

function addMinutesToTime(timeStr: string, minsToAdd: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const totalMins = h * 60 + m + minsToAdd;
  const newH = Math.floor(totalMins / 60) % 24;
  const newM = totalMins % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const authUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only admins can generate timetables" }, { status: 403 });
    }

    const body = (await request.json()) as {
      department: string;
      semester: number;
      shift: string;
      rooms?: string[];
      startTime?: string;
      duration?: number;
      slotsCount?: number;
      days?: string[];
    };

    const department = body.department;
    const semester = Number(body.semester);
    const shift = body.shift || "Morning";
    const rooms = body.rooms && body.rooms.length > 0 ? body.rooms : ["Room 101", "Room 102", "Lab 1"];
    const startTime = body.startTime || "07:45";
    const duration = Number(body.duration) || 45;
    const slotsCount = Number(body.slotsCount) || 6;
    const days = body.days && body.days.length > 0 ? body.days : TIMETABLE_DAYS.slice(0, 5);

    if (!department || isNaN(semester)) {
      return NextResponse.json({ error: "Department and semester are required" }, { status: 400 });
    }

    // 1. Fetch courses for this department & semester
    const courses = await prisma.course.findMany({
      where: { department, semester },
      include: {
        faculty: { include: { user: { select: { name: true } } } },
        facultyMorning: { include: { user: { select: { name: true } } } },
        facultyEvening: { include: { user: { select: { name: true } } } },
      },
    });

    if (courses.length === 0) {
      return NextResponse.json(
        { error: `No courses found for ${department} - Semester ${semester}` },
        { status: 404 }
      );
    }

    // Generate timeslots array
    const timeslots: { start: string; end: string }[] = [];
    let currentStart = startTime;
    for (let i = 0; i < slotsCount; i++) {
      const currentEnd = addMinutesToTime(currentStart, duration);
      timeslots.push({ start: currentStart, end: currentEnd });
      currentStart = currentEnd;
    }

    // Fetch existing timetable entries to avoid collisions
    const existingEntries = await prisma.timetable.findMany({
      include: {
        course: {
          select: {
            assignedFaculty: true,
            assignedFacultyMorning: true,
            assignedFacultyEvening: true,
          },
        },
      },
    });

    const generatedSchedule: {
      courseId: string;
      courseCode: string;
      courseName: string;
      day: string;
      startTime: string;
      endTime: string;
      room: string;
      facultyName: string;
    }[] = [];

    // Map course faculty IDs per shift
    const courseFacultyMap = new Map<string, string | null>();
    courses.forEach((c) => {
      let facId: string | null = null;
      if (shift === "Morning") {
        facId = c.assignedFacultyMorning || c.assignedFaculty || null;
      } else if (shift === "Evening") {
        facId = c.assignedFacultyEvening || c.assignedFaculty || null;
      } else {
        facId = c.assignedFaculty || c.assignedFacultyMorning || c.assignedFacultyEvening || null;
      }
      courseFacultyMap.set(c.id, facId);
    });

    let courseIdx = 0;
    for (const day of days) {
      for (const slot of timeslots) {
        if (courseIdx >= courses.length * 2) break; // limit lectures per day

        const candidateCourse = courses[courseIdx % courses.length];
        const candidateFacId = courseFacultyMap.get(candidateCourse.id);
        const room = rooms[(courseIdx + days.indexOf(day)) % rooms.length];

        // Check if room or faculty is already booked in database or generated batch
        const isRoomBusy =
          existingEntries.some(
            (e) =>
              e.day === day &&
              e.room.trim().toLowerCase() === room.trim().toLowerCase() &&
              hasTimeOverlap(slot.start, slot.end, e.startTime, e.endTime)
          ) ||
          generatedSchedule.some(
            (g) => g.day === day && g.room.trim().toLowerCase() === room.trim().toLowerCase() && g.startTime === slot.start
          );

        const isFacultyBusy =
          candidateFacId &&
          (existingEntries.some(
            (e) =>
              e.day === day &&
              (e.course?.assignedFaculty === candidateFacId ||
                e.course?.assignedFacultyMorning === candidateFacId ||
                e.course?.assignedFacultyEvening === candidateFacId) &&
              hasTimeOverlap(slot.start, slot.end, e.startTime, e.endTime)
          ) ||
            generatedSchedule.some(
              (g) =>
                g.day === day &&
                g.startTime === slot.start &&
                courseFacultyMap.get(g.courseId) === candidateFacId
            ));

        if (!isRoomBusy && !isFacultyBusy) {
          const facName =
            (shift === "Morning" ? candidateCourse.facultyMorning?.user?.name : candidateCourse.facultyEvening?.user?.name) ||
            candidateCourse.faculty?.user?.name ||
            "Faculty Member";

          generatedSchedule.push({
            courseId: candidateCourse.id,
            courseCode: candidateCourse.courseCode,
            courseName: candidateCourse.courseName,
            day,
            startTime: slot.start,
            endTime: slot.end,
            room,
            facultyName: facName,
          });
        }
        courseIdx++;
      }
    }

    if (generatedSchedule.length === 0) {
      return NextResponse.json(
        { error: "Could not generate conflict-free slots. Try adding more rooms or timeslots." },
        { status: 409 }
      );
    }

    // Save automatically created schedule into Timetable
    const created = await prisma.$transaction(
      generatedSchedule.map((entry) =>
        prisma.timetable.create({
          data: {
            shift,
            courseId: entry.courseId,
            day: entry.day,
            startTime: entry.startTime,
            endTime: entry.endTime,
            room: entry.room,
          },
        })
      )
    );

    const adminName = await getAdminName(userId);
    await logAuditAction({
      action: "CREATED",
      entity: "Timetable",
      entityId: `AUTO_${department}_SEM${semester}`,
      description: `Auto-generated ${created.length} timetable slots for ${department} Sem ${semester} (${shift})`,
      adminClerkId: userId,
      adminName,
    });

    return NextResponse.json({
      success: true,
      count: created.length,
      schedule: generatedSchedule,
    });
  } catch (error) {
    console.error("POST /api/timetable/auto-generate error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
