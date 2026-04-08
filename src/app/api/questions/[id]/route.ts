import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      text?: string;
      options?: string[];
      correctOption?: number;
    };

    // Load user role and faculty info
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, clerkId: true, faculty: { select: { id: true } } },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Load question with parent quiz and course info
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        quiz: {
          include: {
            course: { select: { assignedFaculty: true } },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Verify authorization: admin or faculty assigned to course or quiz creator
    const isAdmin = user.role === "ADMIN";
    const isFacultyAssignedToCourse =
      user.faculty && question.quiz.course?.assignedFaculty === user.faculty.id;
    const isQuizCreator = question.quiz.createdBy === user.clerkId;

    if (!isAdmin && !isFacultyAssignedToCourse && !isQuizCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.question.update({
      where: { id },
      data: {
        ...(body.text !== undefined ? { text: body.text } : {}),
        ...(body.options !== undefined ? { options: body.options } : {}),
        ...(body.correctOption !== undefined ? { correctOption: body.correctOption } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/questions/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    // Load user role and faculty info
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, clerkId: true, faculty: { select: { id: true } } },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Load question with parent quiz and course info
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        quiz: {
          include: {
            course: { select: { assignedFaculty: true } },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Verify authorization: admin or faculty assigned to course or quiz creator
    const isAdmin = user.role === "ADMIN";
    const isFacultyAssignedToCourse =
      user.faculty && question.quiz.course?.assignedFaculty === user.faculty.id;
    const isQuizCreator = question.quiz.createdBy === user.clerkId;

    if (!isAdmin && !isFacultyAssignedToCourse && !isQuizCreator) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.question.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/questions/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}