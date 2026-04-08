import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FeedbackType, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Load user with role and associated records
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        role: true,
        student: { select: { id: true } },
        faculty: { select: { id: true } },
      },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const targetId = searchParams.get("targetId");
    const type = searchParams.get("type") as FeedbackType | null;

    // Build where clause with authorization checks
    const isAdmin = user.role === "ADMIN";
    const isFaculty = user.role === "FACULTY";

    // Admin and faculty can see feedback, students can only see their own
    let whereClause: Prisma.FeedbackWhereInput = {
      ...(targetId ? { targetId } : {}),
      ...(type ? { type } : {}),
    };

    if (!isAdmin && !isFaculty) {
      // Students can only see their own feedback
      if (!user.student) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      whereClause = { ...whereClause, studentId: user.student.id };
    }

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      select: {
        id: true,
        type: true,
        targetId: true,
        rating: true,
        comment: true,
        date: true,
        // studentId intentionally excluded from public response
      },
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("GET /api/feedback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as {
      type: FeedbackType;
      targetId: string;
      rating: number;
      comment?: string;
    };

    // Resolve the student DB record from the authenticated Clerk user
    const student = await prisma.student.findFirst({
      where: { user: { clerkId: userId } },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Only students can submit feedback" },
        { status: 403 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        studentId: student.id,
        type: body.type,
        targetId: body.targetId,
        rating: body.rating,
        comment: body.comment ?? "",
      },
      select: {
        id: true,
        type: true,
        targetId: true,
        rating: true,
        comment: true,
        date: true,
        // studentId not returned
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}