import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = request.nextUrl;
    const department = searchParams.get("department");
    const semester = searchParams.get("semester");
    const courseId = searchParams.get("courseId");

    const timetables = await prisma.timetable.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        ...(department || semester
          ? {
              course: {
                ...(department ? { department } : {}),
                ...(semester ? { semester: parseInt(semester) } : {}),
              },
            }
          : {}),
      },
      include: {
        course: {
          include: {
            faculty: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });

    return NextResponse.json(timetables);
  } catch (error) {
    console.error("GET /api/timetable error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Check user role - only admin can create timetable entries
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as {
      courseId: string;
      room: string;
      day: string;
      startTime: string;
      endTime: string;
    };

    // Load course to find assigned faculty
    const course = await prisma.course.findUnique({
      where: { id: body.courseId },
      select: { assignedFaculty: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Conflict check: same room at same day+startTime
    const roomConflict = await prisma.timetable.findFirst({
      where: { room: body.room, day: body.day, startTime: body.startTime },
    });

    if (roomConflict) {
      return NextResponse.json(
        { error: `Room "${body.room}" is already booked on ${body.day} at ${body.startTime}` },
        { status: 409 }
      );
    }

    // Conflict check: same faculty at same day+startTime
    if (course.assignedFaculty) {
      const facultyConflict = await prisma.timetable.findFirst({
        where: {
          day: body.day,
          startTime: body.startTime,
          course: { assignedFaculty: course.assignedFaculty },
        },
      });

      if (facultyConflict) {
        return NextResponse.json(
          {
            error: `Faculty is already assigned to another class on ${body.day} at ${body.startTime}`,
          },
          { status: 409 }
        );
      }
    }

    const timetable = await prisma.timetable.create({
      data: {
        courseId: body.courseId,
        room: body.room,
        day: body.day,
        startTime: body.startTime,
        endTime: body.endTime,
      },
    });

    return NextResponse.json(timetable, { status: 201 });
  } catch (error) {
    console.error("POST /api/timetable error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}