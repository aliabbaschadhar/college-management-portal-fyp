import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = request.nextUrl;
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");

    const quizzes = await prisma.quiz.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        ...(status ? { status } : {}),
      },
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
    const body = (await request.json()) as {
      title: string;
      courseId: string;
      createdBy: string;
      duration: number;
      totalMarks: number;
      dueDate: string;
      status: string;
    };

    const quiz = await prisma.quiz.create({
      data: {
        title: body.title,
        courseId: body.courseId,
        createdBy: body.createdBy,
        duration: body.duration,
        totalMarks: body.totalMarks,
        dueDate: new Date(body.dueDate),
        status: body.status,
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("POST /api/quizzes error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
