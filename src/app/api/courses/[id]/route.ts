import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        faculty: { include: { user: { select: { name: true } } } },
        enrollments: { include: { student: { include: { user: { select: { name: true } } } } } },
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
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("PATCH /api/courses/[id] error:", error);
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
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
