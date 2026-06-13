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
    const body = (await request.json()) as { answers: number[] };

    if (!body || !Array.isArray(body.answers)) {
      return NextResponse.json({ error: "Answers array is required" }, { status: 400 });
    }

    // Load user role and student profile ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, role: true, student: { select: { id: true } } },
    });

    if (!user || user.role !== "STUDENT" || !user.student?.id) {
      return NextResponse.json({ error: "Forbidden: Student profile not found" }, { status: 403 });
    }

    // Fetch the quiz with all its questions (including correct options)
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Verify enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: user.student.id,
        courseId: quiz.courseId,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Forbidden: Not enrolled in this course" }, { status: 403 });
    }

    // Grade the quiz
    const questions = quiz.questions;
    let correct = 0;
    questions.forEach((q, i) => {
      const studentAnswer = body.answers[i];
      if (studentAnswer !== undefined && studentAnswer === q.correctOption) {
        correct++;
      }
    });

    const marksPerQuestion = questions.length > 0 ? quiz.totalMarks / questions.length : 0;
    const score = Math.round(correct * marksPerQuestion);

    // Save the attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        studentId: user.student.id,
        score,
        totalMarks: quiz.totalMarks,
        answers: body.answers,
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      score,
      totalMarks: quiz.totalMarks,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/quizzes/[id]/submit error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
