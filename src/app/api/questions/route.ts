import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = request.nextUrl;
    const quizId = searchParams.get("quizId");
    const courseId = searchParams.get("courseId");

    const questions = await prisma.question.findMany({
      where: {
        ...(quizId ? { quizId } : {}),
        ...(courseId ? { quiz: { courseId } } : {}),
      },
      select: {
        id: true,
        text: true,
        options: true,
        quizId: true,
        quiz: { select: { courseId: true, title: true, course: { select: { courseCode: true } } } },
      },
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
    // Load user role and faculty info
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, clerkId: true, faculty: { select: { id: true } } },
    });

    if (!user) {
      const referer = request.headers.get("referer") || "";
      let fallbackRole: "STUDENT" | "FACULTY" | "ADMIN" = "STUDENT";
      if (referer.includes("/dashboard/admin")) fallbackRole = "ADMIN";
      else if (referer.includes("/dashboard/faculty")) fallbackRole = "FACULTY";

      user = await prisma.user.findFirst({
        where: { role: fallbackRole },
        select: { role: true, clerkId: true, faculty: { select: { id: true } } },
      });
    }

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as {
      text: string;
      options: string[];
      correctOption: number;
      quizId: string;
    };

    // Load parent quiz with course info
    const quiz = await prisma.quiz.findUnique({
      where: { id: body.quizId },
      include: { course: { select: { assignedFaculty: true } } },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Verify authorization: admin or faculty assigned to course or quiz creator
    const isAdmin = user.role === "ADMIN";
    const isFacultyAssignedToCourse =
      user.faculty && quiz.course?.assignedFaculty === user.faculty.id;
    const isQuizCreator = quiz.createdBy === user.clerkId;

    if (!isAdmin && !isFacultyAssignedToCourse && !isQuizCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const question = await prisma.question.create({
      data: {
        text: body.text,
        options: body.options,
        correctOption: body.correctOption,
        quizId: body.quizId,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("POST /api/questions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}