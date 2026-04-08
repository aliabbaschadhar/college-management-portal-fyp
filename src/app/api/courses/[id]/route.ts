import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { Prisma } from "@prisma/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;

    // Load user role to check authorization
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, faculty: { select: { id: true } }, student: { select: { id: true } } },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Determine if user should see enrollments
    const isAdmin = user.role === "ADMIN";
    const isFaculty = user.role === "FACULTY";

    // If faculty, verify they're assigned to this course
    let canSeeEnrollments = isAdmin;
    if (isFaculty && user.faculty) {
      const courseCheck = await prisma.course.findUnique({
        where: { id },
        select: { assignedFaculty: true },
      });
      canSeeEnrollments = courseCheck?.assignedFaculty === user.faculty.id;
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        faculty: { include: { user: { select: { name: true } } } },
        ...(canSeeEnrollments
          ? { enrollments: { include: { student: { include: { user: { select: { name: true } } } } } } }
          : {}),
      },
    });

    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
    return NextResponse.json(course);
  } catch (error) {
    console.error("GET /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireRole(["ADMIN", "FACULTY"]);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = (await request.json()) as {
      courseCode?: string;
      courseName?: string;
      creditHours?: number;
      department?: string;
      semester?: number;
      assignedFaculty?: string | null;
    };

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(body.courseCode !== undefined ? { courseCode: body.courseCode } : {}),
        ...(body.courseName !== undefined ? { courseName: body.courseName } : {}),
        ...(body.creditHours !== undefined ? { creditHours: body.creditHours } : {}),
        ...(body.department !== undefined ? { department: body.department } : {}),
        ...(body.semester !== undefined ? { semester: body.semester } : {}),
        ...(body.assignedFaculty !== undefined ? { assignedFaculty: body.assignedFaculty } : {}),
      },
      include: {
        faculty: { include: { user: { select: { name: true } } } },
        _count: { select: { enrollments: true } },
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Course code already exists" }, { status: 409 });
      }
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
    }
    console.error("PATCH /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireRole(["ADMIN"]);
  if (denied) return denied;

  try {
    const { id } = await params;
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    console.error("DELETE /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}