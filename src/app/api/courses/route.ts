import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const courses = await prisma.course.findMany({
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
    const body = (await request.json()) as {
      courseCode: string;
      courseName: string;
      creditHours: number;
      department: string;
      semester?: number;
      assignedFaculty?: string;
    };

    const course = await prisma.course.create({
      data: {
        courseCode: body.courseCode,
        courseName: body.courseName,
        creditHours: body.creditHours,
        department: body.department,
        semester: body.semester ?? 1,
        assignedFaculty: body.assignedFaculty ?? null,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
