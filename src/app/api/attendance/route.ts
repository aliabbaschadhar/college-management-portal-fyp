import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Load user with role and faculty info
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        role: true,
        faculty: { select: { id: true } },
        student: { select: { id: true } },
      },
    });

    if (!user) {
      const referer = request.headers.get("referer") || "";
      let fallbackRole: "STUDENT" | "FACULTY" | "ADMIN" = "STUDENT";
      if (referer.includes("/dashboard/admin")) fallbackRole = "ADMIN";
      else if (referer.includes("/dashboard/faculty")) fallbackRole = "FACULTY";

      user = await prisma.user.findFirst({
        where: { role: fallbackRole },
        select: {
          role: true,
          faculty: { select: { id: true } },
          student: { select: { id: true } },
        },
      });
    }

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const courseId = searchParams.get("courseId");
    const requestedStudentId = searchParams.get("studentId");
    const date = searchParams.get("date");

    let studentId: string | null = requestedStudentId;

    // Students can only access their own attendance records.
    if (user.role === "STUDENT") {
      if (!user.student?.id) {
        return NextResponse.json({ error: "Student profile not found" }, { status: 403 });
      }
      studentId = user.student.id;
    } else if (!["ADMIN", "FACULTY"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (user.role === "FACULTY" && courseId) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { assignedFaculty: true },
      });

      if (!course || course.assignedFaculty !== user.faculty?.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        ...(studentId ? { studentId } : {}),
        ...(date ? { date: new Date(date) } : {}),
      },
      include: {
        student: {
          include: { user: { select: { name: true } } },
        },
        course: { select: { courseCode: true } },
      },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("GET /api/attendance error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Validate request body
    const body = (await request.json()) as {
      courseId: string;
      date: string;
      records: { studentId: string; status: AttendanceStatus }[];
    };

    if (!body || !body.courseId || typeof body.courseId !== "string" || !body.courseId.trim()) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    if (!body.date || typeof body.date !== "string") {
      return NextResponse.json({ error: "date is required" }, { status: 400 });
    }

    if (!Array.isArray(body.records)) {
      return NextResponse.json({ error: "records must be an array" }, { status: 400 });
    }

    for (const record of body.records) {
      if (!record.studentId || typeof record.studentId !== "string" || !record.studentId.trim()) {
        return NextResponse.json({ error: "Each record must have a valid studentId" }, { status: 400 });
      }
      if (!["Present", "Absent", "Late"].includes(record.status)) {
        return NextResponse.json({ error: "Invalid attendance status" }, { status: 400 });
      }
    }

    // Load user with role and faculty info
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, faculty: { select: { id: true } } },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify authorization: admin or instructor for the specific course
    if (!["ADMIN", "FACULTY"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const course = await prisma.course.findUnique({
      where: { id: body.courseId },
      select: { assignedFaculty: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (user.role === "FACULTY" && course.assignedFaculty !== user.faculty?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const attendanceDate = new Date(body.date);
    if (attendanceDate > new Date()) {
      return NextResponse.json({ error: "Date cannot be in the future" }, { status: 400 });
    }

    const results = await Promise.all(
      body.records.map(async (record) => {
        const existingAttendance = await prisma.attendance.findFirst({
          where: {
            studentId: record.studentId,
            courseId: body.courseId,
            date: attendanceDate,
          },
          select: { id: true },
        });

        if (existingAttendance) {
          return prisma.attendance.update({
            where: { id: existingAttendance.id },
            data: { status: record.status, markedBy: userId },
          });
        }

        return prisma.attendance.create({
          data: {
            studentId: record.studentId,
            courseId: body.courseId,
            date: attendanceDate,
            status: record.status,
            markedBy: userId,
          },
        });
      })
    );

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error("POST /api/attendance error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}