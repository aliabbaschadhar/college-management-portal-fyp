import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ensureStudentEnrollments } from "@/lib/services/student";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Load user to determine filtering
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        role: true,
        faculty: { select: { id: true } },
        student: { select: { id: true, department: true, semester: true } },
      },
    });

    if (!user) {
      // Provision user as STUDENT by default if authenticated in Clerk
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name: name || "New User",
          role: "STUDENT",
        },
        select: {
          role: true,
          faculty: { select: { id: true } },
          student: { select: { id: true, department: true, semester: true } },
        },
      });
    }

    // Build where clause based on role
    const whereClause: Prisma.CourseWhereInput = {};

    if (user.role === "FACULTY" && user.faculty) {
      // Faculty only see courses assigned to them
      whereClause.assignedFaculty = user.faculty.id;
    } else if (user.role === "STUDENT") {
      if (user.student) {
        // Self-healing enrollments sync
        await ensureStudentEnrollments(user.student.id, user.student.department, user.student.semester);

        // Students only see courses they are enrolled in for their current semester
        whereClause.semester = user.student.semester;
        whereClause.enrollments = {
          some: { studentId: user.student.id },
        };
      }
      // If no student profile exists, they are onboarding.
      // Do not filter by enrollment (allows listing all courses in the catalog).
    }
    // Admin sees all courses (no filter)

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
      faculty: c.faculty ? { user: { name: c.faculty.user.name } } : null,
      _count: { enrollments: c._count.enrollments },
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

    if (!user || user.role?.toUpperCase() !== "ADMIN") {
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

      if (!faculty || faculty.user.role?.toUpperCase() !== "FACULTY") {
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