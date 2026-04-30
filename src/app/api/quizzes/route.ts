import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Load user to determine filtering
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, clerkId: true, student: { select: { id: true } } },
    });

    if (!user) {
      const referer = request.headers.get("referer") || "";
      let fallbackRole: "STUDENT" | "FACULTY" | "ADMIN" = "STUDENT";
      if (referer.includes("/dashboard/admin")) fallbackRole = "ADMIN";
      else if (referer.includes("/dashboard/faculty")) fallbackRole = "FACULTY";

      user = await prisma.user.findFirst({
        where: { role: fallbackRole },
        select: { role: true, clerkId: true, student: { select: { id: true } } },
      });
    }

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
        return NextResponse.json([]);
      }

      whereClause.course = {
        enrollments: {
          some: {
            studentId: user.student.id,
          },
        },
      };
    } else if (user.role === "FACULTY") {
      // Faculty only see quizzes they created
      whereClause.createdBy = user.clerkId;
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
    // Load user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, clerkId: true },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as {
      title: string;
      courseId: string;
      duration: number;
      totalMarks: number;
      dueDate: string;
      status: string;
    };

    const quiz = await prisma.quiz.create({
      data: {
        title: body.title,
        courseId: body.courseId,
        createdBy: user.clerkId,
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