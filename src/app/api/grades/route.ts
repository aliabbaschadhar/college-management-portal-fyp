import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = request.nextUrl;
    const courseId = searchParams.get("courseId");
    const studentId = searchParams.get("studentId");

    const grades = await prisma.grade.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        ...(studentId ? { studentId } : {}),
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
    const body = (await request.json()) as {
      studentId: string;
      courseId: string;
      quizMarks: number;
      assignmentMarks: number;
      midMarks: number;
      finalMarks: number;
    };

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
