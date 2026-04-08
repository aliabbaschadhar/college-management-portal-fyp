import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Load user with role and faculty/student info
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        role: true,
        faculty: { select: { id: true } },
        student: { select: { id: true } },
      },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const courseId = searchParams.get("courseId");
    const studentId = searchParams.get("studentId");

    // Verify authorization
    const isAdmin = user.role === "ADMIN";
    const isFaculty = user.role === "FACULTY";

    if (!isAdmin && !isFaculty) {
      // Students can only see their own grades
      if (!user.student) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (studentId && studentId !== user.student.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // If faculty and courseId specified, verify they're assigned to it
    if (isFaculty && courseId && user.faculty) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { assignedFaculty: true },
      });
      if (!course || course.assignedFaculty !== user.faculty.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // If studentId is provided, ensure only authorized users can view
    if (studentId && !isAdmin && !isFaculty) {
      if (!user.student || user.student.id !== studentId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const grades = await prisma.grade.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        ...(studentId ? { studentId } : {}),
        ...(!isAdmin && !isFaculty && user.student ? { studentId: user.student.id } : {}),
      },
      include: {
        student: {
          include: { user: { select: { name: true } } },
        },
        course: { select: { courseCode: true } },
      },
    });

    return NextResponse.json(grades);
  } catch (error) {
    console.error("GET /api/grades error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Check user role - only admin/faculty can create/update grades
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, faculty: { select: { id: true } } },
    });

    if (!user || !["ADMIN", "FACULTY"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as {
      studentId: string;
      courseId: string;
      quizMarks: number;
      assignmentMarks: number;
      midMarks: number;
      finalMarks: number;
    };

    // If faculty, verify they're assigned to the course
    if (user.role === "FACULTY" && user.faculty) {
      const course = await prisma.course.findUnique({
        where: { id: body.courseId },
        select: { assignedFaculty: true },
      });
      if (!course || course.assignedFaculty !== user.faculty.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const existing = await prisma.grade.findFirst({
      where: { studentId: body.studentId, courseId: body.courseId },
    });

    if (existing?.locked) {
      return NextResponse.json({ error: "Grade is locked" }, { status: 403 });
    }

    const total = body.quizMarks + body.assignmentMarks + body.midMarks + body.finalMarks;
    // Max marks: quiz(25) + assignment(25) + mid(50) + final(50) = 150
    const MAX_MARKS = 150;
    const gpa = +Math.min(4.0, (total / MAX_MARKS) * 4.0).toFixed(2);

    const data = {
      quizMarks: body.quizMarks,
      assignmentMarks: body.assignmentMarks,
      midMarks: body.midMarks,
      finalMarks: body.finalMarks,
      total,
      gpa,
    };

    const grade = existing
      ? await prisma.grade.update({ where: { id: existing.id }, data })
      : await prisma.grade.create({
          data: {
            studentId: body.studentId,
            courseId: body.courseId,
            ...data,
          },
        });

    return NextResponse.json(grade, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error("POST /api/grades error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}