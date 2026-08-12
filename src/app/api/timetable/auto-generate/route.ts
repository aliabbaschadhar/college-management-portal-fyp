import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { TIMETABLE_DAYS } from "@/lib/timetable";
import { logAuditAction, getAdminName } from "@/lib/audit-log";
import {
  solveTimetableCSP,
  CSPTimeSlot,
  CSPSlotRequest,
  ExistingBooking,
} from "@/lib/timetable-csp";

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
      return NextResponse.json(
        { error: "Forbidden: Only admins can generate timetables" },
        { status: 403 }
      );
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
      courseSlotTargets?: Record<string, number>;
      overwriteExisting?: boolean;
    };

    const department = body.department;
    const semester = Number(body.semester);
    const shift = body.shift || "Morning";
    const rooms =
      body.rooms && body.rooms.length > 0
        ? body.rooms.map((r) => r.trim()).filter(Boolean)
        : ["Room 101", "Room 102", "Lab 1"];
    const startTime = body.startTime || "07:45";
    const duration = Number(body.duration) || 45;
    const slotsCount = Number(body.slotsCount) || 7;
    const days =
      body.days && body.days.length > 0
        ? body.days
        : TIMETABLE_DAYS.slice(0, 5);
    const courseSlotTargets = body.courseSlotTargets || {};
    const overwriteExisting =
      typeof body.overwriteExisting === "boolean" ? body.overwriteExisting : true;

    if (!department || isNaN(semester)) {
      return NextResponse.json(
        { error: "Department and semester are required" },
        { status: 400 }
      );
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

    // 2. Generate timeslots array
    const timeslots: CSPTimeSlot[] = [];
    let currentStart = startTime;
    for (let i = 0; i < slotsCount; i++) {
      const currentEnd = addMinutesToTime(currentStart, duration);
      timeslots.push({
        startTime: currentStart,
        endTime: currentEnd,
        slotIndex: i,
      });
      currentStart = currentEnd;
    }

    // 3. Map courses to CSP slot requests
    const cspCourses: CSPSlotRequest[] = courses.map((c) => {
      let facId: string | null = null;
      let facName = "Unassigned Faculty";

      if (shift === "Morning") {
        facId = c.assignedFacultyMorning || c.assignedFaculty || null;
        facName =
          c.facultyMorning?.user?.name ||
          c.faculty?.user?.name ||
          "Unassigned Faculty";
      } else if (shift === "Evening") {
        facId = c.assignedFacultyEvening || c.assignedFaculty || null;
        facName =
          c.facultyEvening?.user?.name ||
          c.faculty?.user?.name ||
          "Unassigned Faculty";
      } else {
        facId =
          c.assignedFaculty ||
          c.assignedFacultyMorning ||
          c.assignedFacultyEvening ||
          null;
        facName =
          c.faculty?.user?.name ||
          c.facultyMorning?.user?.name ||
          c.facultyEvening?.user?.name ||
          "Unassigned Faculty";
      }

      const customSlots = courseSlotTargets[c.id];
      const requiredSlotsCount =
        typeof customSlots === "number" && customSlots >= 1
          ? customSlots
          : c.creditHours || 3;

      return {
        courseId: c.id,
        courseCode: c.courseCode,
        courseName: c.courseName,
        facultyId: facId,
        facultyName: facName,
        requiredSlotsCount,
      };
    });

    // 4. Fetch all existing timetable entries across ALL departments for global conflict detection
    const allExistingEntries = await prisma.timetable.findMany({
      include: {
        course: {
          select: {
            id: true,
            department: true,
            semester: true,
            assignedFaculty: true,
            assignedFacultyMorning: true,
            assignedFacultyEvening: true,
          },
        },
      },
    });

    const existingBookings: ExistingBooking[] = allExistingEntries.map((e) => {
      let facId: string | null = null;
      if (e.shift === "Morning") {
        facId = e.course?.assignedFacultyMorning || e.course?.assignedFaculty || null;
      } else if (e.shift === "Evening") {
        facId = e.course?.assignedFacultyEvening || e.course?.assignedFaculty || null;
      } else {
        facId = e.course?.assignedFaculty || null;
      }

      return {
        day: e.day,
        startTime: e.startTime,
        endTime: e.endTime,
        room: e.room,
        facultyId: facId,
        department: e.course?.department,
        semester: e.course?.semester,
        shift: e.shift,
        courseId: e.courseId,
      };
    });

    // 5. Solve using CSP Engine
    const cspResult = solveTimetableCSP({
      department,
      semester,
      shift,
      days,
      rooms,
      timeslots,
      courses: cspCourses,
      existingBookings,
      overwriteExisting,
    });

    if (!cspResult.success) {
      return NextResponse.json(
        {
          error: cspResult.error || "Failed to generate conflict-free schedule.",
          diagnostics: cspResult.diagnostics,
        },
        { status: 409 }
      );
    }

    // 6. Save automatically created schedule into database atomically
    const assignments = cspResult.assignments;

    const result = await prisma.$transaction(async (tx) => {
      if (overwriteExisting) {
        // Delete previous timetable entries for this specific section
        await tx.timetable.deleteMany({
          where: {
            shift,
            course: {
              department,
              semester,
            },
          },
        });
      }

      const createdEntries = await Promise.all(
        assignments.map((entry) =>
          tx.timetable.create({
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

      return createdEntries;
    });

    const adminName = await getAdminName(userId);
    await logAuditAction({
      action: overwriteExisting ? "UPDATED" : "CREATED",
      entity: "Timetable",
      entityId: `AUTO_${department}_SEM${semester}_${shift}`,
      description: `Auto-generated ${result.length} conflict-free timetable slots for ${department} Sem ${semester} (${shift})`,
      adminClerkId: userId,
      adminName,
    });

    return NextResponse.json({
      success: true,
      count: result.length,
      schedule: assignments,
    });
  } catch (error) {
    console.error("POST /api/timetable/auto-generate error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
