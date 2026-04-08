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
      include: { quiz: { select: { courseId: true, title: true } } },
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
    const body = (await request.json()) as {
      text: string;
      options: string[];
      correctOption: number;
      quizId: string;
    };

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
