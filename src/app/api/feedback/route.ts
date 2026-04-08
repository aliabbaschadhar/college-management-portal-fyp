import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FeedbackType } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = request.nextUrl;
    const targetId = searchParams.get("targetId");
    const type = searchParams.get("type") as FeedbackType | null;

    const feedbacks = await prisma.feedback.findMany({
      where: {
        ...(targetId ? { targetId } : {}),
        ...(type ? { type } : {}),
      },
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
      studentId: string;
      type: FeedbackType;
      targetId: string;
      rating: number;
      comment: string;
    };

    const feedback = await prisma.feedback.create({
      data: {
        studentId: body.studentId,
        type: body.type,
        targetId: body.targetId,
        rating: body.rating,
        comment: body.comment,
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
