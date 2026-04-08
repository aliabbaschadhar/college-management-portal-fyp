import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(_request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Load user to determine filtering
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, faculty: { select: { id: true } } },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Faculty users only see courses assigned to them
    const whereClause: { assignedFaculty?: string } = {};
    if (user.role === "FACULTY" && user.faculty) {
      whereClause.assignedFaculty = user.faculty.id;
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        faculty: {
          include: { user: { select: { name: true } } },
        },
        _count: { select: { enrollments: true } },
      },
    });

    const result = courses.map((c) => ({
      id: c.id,
      courseCode: c.courseCode,
      courseName: c.courseName,
      creditHours: c.creditHours,
      department: c.department,
      semester: c.semester,
      assignedFaculty: c.assignedFaculty,
      facultyName: c.faculty?.user.name ?? null,
      enrolledCount: c._count.enrollments,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Check user role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as {
      courseCode: string;
      courseName: string;
      creditHours: number;
      department: string;
      semester?: number;
      assignedFaculty?: string;
    };

    // If assignedFaculty is provided, validate it exists and has FACULTY role
    if (body.assignedFaculty) {
      const faculty = await prisma.faculty.findUnique({
        where: { id: body.assignedFaculty },
        include: { user: { select: { role: true } } },
      });

      if (!faculty || faculty.user.role !== "FACULTY") {
        return NextResponse.json(
          { error: "Invalid faculty assignment: faculty not found or user is not FACULTY" },
          { status: 400 }
        );
      }
    }

    const course = await prisma.course.create({
      data: {
        courseCode: body.courseCode,
        courseName: body.courseName,
        creditHours: body.creditHours,
        department: body.department,
        semester: body.semester ?? 1,
        assignedFaculty: body.assignedFaculty ?? null,
      },
      include: {
        faculty: { include: { user: { select: { name: true } } } },
        _count: { select: { enrollments: true } },
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A course with this code already exists" },
        { status: 409 }
      );
    }
    console.error("POST /api/courses error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}