import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Load user role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only admin and faculty can list students
    if (!["ADMIN", "FACULTY"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const department = searchParams.get("department");
    const search = searchParams.get("search");
    const courseId = searchParams.get("courseId");

    const students = await prisma.student.findMany({
      where: {
        ...(department ? { department } : {}),
        ...(search
          ? {
              OR: [
                { user: { name: { contains: search, mode: "insensitive" } } },
                { rollNo: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(courseId ? { enrollments: { some: { courseId } } } : {}),
      },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { enrollments: true } },
      },
    });

    const result = students.map((s) => ({
      id: s.id,
      userId: s.userId,
      rollNo: s.rollNo,
      phone: s.phone,
      department: s.department,
      semester: s.semester,
      enrollmentDate: s.enrollmentDate.toISOString(),
      avatar: s.avatar,
      user: {
        name: s.user.name,
        email: s.user.email,
      },
      _count: {
        enrollments: s._count.enrollments,
      },
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/students error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Load authenticated user role
    const authUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, id: true },
    });

    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only admin can create student records
    if (authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as {
      userId: string;
      rollNo: string;
      phone?: string;
      department: string;
      semester?: number;
    };

    const user = await prisma.user.findUnique({ where: { id: body.userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.role !== "STUDENT")
      return NextResponse.json({ error: "User is not a STUDENT" }, { status: 400 });

    const student = await prisma.student.create({
      data: {
        userId: body.userId,
        rollNo: body.rollNo,
        phone: body.phone,
        department: body.department,
        semester: body.semester ?? 1,
      },
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A student with this roll number already exists" },
        { status: 409 }
      );
    }
    console.error("POST /api/students error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}