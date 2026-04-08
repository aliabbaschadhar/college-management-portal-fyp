import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AttendanceStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = request.nextUrl;
    const courseId = searchParams.get("courseId");
    const studentId = searchParams.get("studentId");
    const date = searchParams.get("date");

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
    const body = (await request.json()) as {
      courseId: string;
      date: string;
      records: { studentId: string; status: AttendanceStatus }[];
    };

    const attendanceDate = new Date(body.date);
    if (attendanceDate > new Date()) {
      return NextResponse.json({ error: "Date cannot be in the future" }, { status: 400 });
    }

    const results = await Promise.all(
      body.records.map((record) =>
        prisma.attendance.upsert({
          where: {
            studentId_courseId_date: {
              studentId: record.studentId,
              courseId: body.courseId,
              date: attendanceDate,
            },
          },
          update: { status: record.status, markedBy: userId },
          create: {
            studentId: record.studentId,
            courseId: body.courseId,
            date: attendanceDate,
            status: record.status,
            markedBy: userId,
          },
        })
      )
    );

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error("POST /api/attendance error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
