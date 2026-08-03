import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Load user to determine filtering
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        role: true,
        clerkId: true,
        student: { select: { id: true } },
        faculty: { select: { id: true } },
      },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");

    const whereClause: Prisma.QuizWhereInput = {
      ...(courseId ? { courseId } : {}),
      ...(status ? { status } : {}),
    };

    if (user.role === "STUDENT") {
      if (!user.student?.id) {
        return NextResponse.json({ error: "Forbidden: Student profile not found" }, { status: 403 });
      }

      whereClause.course = {
        enrollments: {
          some: {
            studentId: user.student.id,
          },
        },
      };
    } else if (user.role === "FACULTY") {
      // Faculty see quizzes they created OR quizzes for courses they teach
      whereClause.OR = [
        { createdBy: userId },
        { course: { assignedFaculty: user.faculty?.id } },
      ];
    }

    const quizzes = await prisma.quiz.findMany({
      where: whereClause,
      include: {
        course: { select: { courseCode: true, courseName: true } },
        _count: { select: { questions: true } },
      },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("GET /api/quizzes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, clerkId: true, faculty: { select: { id: true, department: true } } },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as {
      title: string;
      courseId: string;
      duration: number;
      totalMarks?: number;
      dueDate: string;
      status: string;
      questionIds?: string[];
    };

    // Authorization: faculty can only create quizzes for courses in their dept or explicitly assigned to them
    if (user.role === "FACULTY" && user.faculty) {
      const course = await prisma.course.findUnique({
        where: { id: body.courseId },
        select: { department: true, assignedFaculty: true },
      });
      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
      const isAllowed =
        course.department === user.faculty.department ||
        course.assignedFaculty === user.faculty.id;
      if (!isAllowed) {
        return NextResponse.json({ error: "Forbidden: You can only create quizzes for courses in your department or assigned to you" }, { status: 403 });
      }
    }

    let calculatedMarks = body.totalMarks ?? 0;
    if (body.questionIds && body.questionIds.length > 0) {
      const selectedQuestions = await prisma.question.findMany({
        where: { id: { in: body.questionIds } },
        select: { marks: true },
      });
      calculatedMarks = selectedQuestions.reduce((acc, q) => acc + (q.marks || 1), 0);
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: body.title,
        courseId: body.courseId,
        createdBy: userId,
        duration: body.duration,
        totalMarks: calculatedMarks || 10,
        dueDate: new Date(body.dueDate.includes("T") ? body.dueDate : `${body.dueDate}T23:59:59`),
        status: body.status,
        ...(body.questionIds && body.questionIds.length > 0
          ? { questions: { connect: body.questionIds.map((id) => ({ id })) } }
          : {}),
      },
      include: {
        course: { select: { courseCode: true, courseName: true } },
        questions: true,
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("POST /api/quizzes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}