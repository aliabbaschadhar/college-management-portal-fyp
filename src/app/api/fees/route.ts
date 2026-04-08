import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FeeStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Load user with role and student info
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, student: { select: { id: true } } },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status") as FeeStatus | null;

    // Build where clause based on role
    const isAdmin = user.role === "ADMIN";
    const isFaculty = user.role === "FACULTY";

    let whereClause: { studentId?: string; status?: FeeStatus } = {
      ...(status ? { status } : {}),
    };

    if (studentId) {
      // If specific studentId requested, verify permissions
      if (!isAdmin && !isFaculty) {
        // Students can only view their own fees
        if (!user.student || user.student.id !== studentId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
      whereClause.studentId = studentId;
    } else {
      // No studentId specified
      if (!isAdmin && !isFaculty) {
        // Students must filter by their own ID
        if (!user.student) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        whereClause.studentId = user.student.id;
      }
    }

    const fees = await prisma.fee.findMany({
      where: whereClause,
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
    // Check user role - only admin/faculty can create fees
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || !["ADMIN", "FACULTY"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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