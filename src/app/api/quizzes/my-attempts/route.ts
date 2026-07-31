import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, student: { select: { id: true } } },
    });

    if (!user || user.role !== "STUDENT" || !user.student?.id) {
      return NextResponse.json({ error: "Forbidden: Student profile not found" }, { status: 403 });
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: { studentId: user.student.id },
      include: {
        quiz: {
          include: {
            course: { select: { courseCode: true, courseName: true } },
            _count: { select: { questions: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error("GET /api/quizzes/my-attempts error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
