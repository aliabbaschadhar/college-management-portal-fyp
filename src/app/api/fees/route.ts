import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FeeStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = request.nextUrl;
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status") as FeeStatus | null;

    const fees = await prisma.fee.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        student: {
          include: { user: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json(fees);
  } catch (error) {
    console.error("GET /api/fees error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as {
      studentId: string;
      type: string;
      amount: number;
      dueDate: string;
      semester: number;
    };

    const fee = await prisma.fee.create({
      data: {
        studentId: body.studentId,
        type: body.type,
        amount: body.amount,
        dueDate: new Date(body.dueDate),
        semester: body.semester,
      },
    });

    return NextResponse.json(fee, { status: 201 });
  } catch (error) {
    console.error("POST /api/fees error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
