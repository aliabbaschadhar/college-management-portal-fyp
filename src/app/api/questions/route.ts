import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true, faculty: { select: { id: true } } },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const quizId = searchParams.get("quizId");
    const courseId = searchParams.get("courseId");

    const whereClause: Prisma.QuestionWhereInput = {
      ...(courseId ? { courseId } : {}),
      ...(quizId ? { quizId } : {}),
    };

    if (user.role === "FACULTY" && user.faculty?.id) {
      if (!courseId && !quizId) {
        whereClause.course = { assignedFaculty: user.faculty.id };
      }
    }

    const questions = await prisma.question.findMany({
      where: whereClause,
      select: {
        id: true,
        courseId: true,
        type: true,
        text: true,
        options: true,
        correctOption: true,
        sampleAnswer: true,
        marks: true,
        quizId: true,
        course: { select: { courseCode: true, courseName: true } },
        quiz: { select: { title: true } },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("GET /api/questions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, clerkId: true, faculty: { select: { id: true } } },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as {
      courseId: string;
      type?: "MCQ" | "Short" | "Long";
      text: string;
      options?: string[];
      correctOption?: number | null;
      sampleAnswer?: string;
      marks?: number;
      quizId?: string;
    };

    if (!body.courseId || !body.text) {
      return NextResponse.json({ error: "courseId and text are required" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: body.courseId },
      select: { assignedFaculty: true },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const isAdmin = user.role === "ADMIN";
    const isFacultyAssignedToCourse =
      user.faculty && (course.assignedFaculty === null || course.assignedFaculty === user.faculty.id);

    if (!isAdmin && !isFacultyAssignedToCourse) {
      return NextResponse.json({ error: "Forbidden: You are not assigned to this course" }, { status: 403 });
    }

    const question = await prisma.question.create({
      data: {
        courseId: body.courseId,
        type: body.type ?? "MCQ",
        text: body.text,
        options: body.options ?? [],
        correctOption: body.correctOption ?? null,
        sampleAnswer: body.sampleAnswer ?? null,
        marks: body.marks ?? 1,
        quizId: body.quizId ?? null,
      },
      select: {
        id: true,
        courseId: true,
        type: true,
        text: true,
        options: true,
        correctOption: true,
        sampleAnswer: true,
        marks: true,
        quizId: true,
        course: { select: { courseCode: true, courseName: true } },
        createdAt: true,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("POST /api/questions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}