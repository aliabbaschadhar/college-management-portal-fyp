import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id: quizId } = await params;
    const body = (await request.json()) as { answers?: number[]; studentId?: string; score?: number };

    // Load user role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true, student: { select: { id: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { id: "asc" } } },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    let targetStudentId = user.student?.id;

    // Faculty marking hardform submission for a student
    if (user.role === "FACULTY" || user.role === "ADMIN") {
      if (!body.studentId) {
        return NextResponse.json({ error: "studentId is required for faculty submit" }, { status: 400 });
      }
      targetStudentId = body.studentId;
    }

    if (!targetStudentId) {
      return NextResponse.json({ error: "Forbidden: Student profile not found" }, { status: 403 });
    }

    let score = body.score ?? 0;
    if (Array.isArray(body.answers) && quiz.questions.length > 0) {
      let correct = 0;
      quiz.questions.forEach((q, i) => {
        if (body.answers![i] !== undefined && body.answers![i] === q.correctOption) {
          correct++;
        }
      });
      const marksPerQuestion = quiz.totalMarks / quiz.questions.length;
      score = Math.round(correct * marksPerQuestion);
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId: targetStudentId,
        score,
        totalMarks: quiz.totalMarks,
        answers: body.answers ?? [],
      },
    });

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error("POST /api/quizzes/[id]/submit error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id: quizId } = await params;
    const { searchParams } = request.nextUrl;
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "studentId parameter is required" }, { status: 400 });
    }

    await prisma.quizAttempt.deleteMany({
      where: {
        quizId,
        studentId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/quizzes/[id]/submit error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
