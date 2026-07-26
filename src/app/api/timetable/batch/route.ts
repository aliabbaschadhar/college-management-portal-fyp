import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only admins can batch update timetables" }, { status: 403 });
    }

    const body = (await request.json()) as {
      department: string;
      semester: number;
      shift: string;
      entries: {
        courseId: string;
        day: string;
        startTime: string;
        endTime: string;
        room: string;
      }[];
    };

    if (!body.department || !body.semester || !body.shift || !Array.isArray(body.entries)) {
      return NextResponse.json({ error: "Invalid payload: department, semester, shift, and entries array are required" }, { status: 400 });
    }

    // Verify all courses have assigned teachers before bulk insert
    const courseIds = [...new Set(body.entries.map((e) => e.courseId))];
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, courseCode: true, courseName: true, assignedFaculty: true },
    });

    const unassigned = courses.filter((c) => !c.assignedFaculty);
    if (unassigned.length > 0) {
      return NextResponse.json(
        {
          error: `Unassigned teacher guard: The following courses do not have a teacher assigned: ${unassigned.map((c) => `${c.courseCode} (${c.courseName})`).join(", ")}`,
          unassignedCourseIds: unassigned.map((c) => c.id),
        },
        { status: 400 }
      );
    }

    const created = await prisma.$transaction(
      body.entries.map((entry) =>
        prisma.timetable.create({
          data: {
            shift: body.shift,
            courseId: entry.courseId,
            day: entry.day,
            startTime: entry.startTime,
            endTime: entry.endTime,
            room: entry.room,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: created.length }, { status: 201 });
  } catch (error) {
    console.error("POST /api/timetable/batch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
