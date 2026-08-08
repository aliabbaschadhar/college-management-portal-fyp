import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ensureStudentEnrollments } from "@/lib/services/student";
import { requireRole } from "@/lib/auth-guard";

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
    const userRole = user.role?.toUpperCase();
    const whereClause: Prisma.CourseWhereInput = {};

    if (userRole === "FACULTY" && user.faculty) {
      // Faculty see strictly courses explicitly assigned to them by an admin
      whereClause.OR = [
        { assignedFaculty: user.faculty.id },
        { assignedFacultyMorning: user.faculty.id },
        { assignedFacultyEvening: user.faculty.id },
      ];
    } else if (userRole === "STUDENT" && user.student) {
      await ensureStudentEnrollments(user.student.id, user.student.department, user.student.semester);
      whereClause.semester = user.student.semester;
      whereClause.enrollments = {
        some: { studentId: user.student.id },
      };
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        faculty: {
          include: { user: { select: { name: true } } },
        },
        facultyMorning: {
          include: { user: { select: { name: true } } },
        },
        facultyEvening: {
          include: { user: { select: { name: true } } },
        },
        timetables: true,
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                rollNo: true,
                phone: true,
                department: true,
                semester: true,
                shift: true,
                enrollmentDate: true,
                user: { select: { name: true, email: true } },
              },
            },
          },
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
      assignedFacultyMorning: c.assignedFacultyMorning,
      assignedFacultyEvening: c.assignedFacultyEvening,
      shift: c.shift,
      timetables: c.timetables,
      enrollments: c.enrollments,
      faculty: c.faculty
        ? {
            user: { name: c.faculty.user.name },
            department: c.faculty.department,
          }
        : null,
      facultyMorning: c.facultyMorning
        ? {
            user: { name: c.facultyMorning.user.name },
            department: c.facultyMorning.department,
          }
        : null,
      facultyEvening: c.facultyEvening
        ? {
            user: { name: c.facultyEvening.user.name },
            department: c.facultyEvening.department,
          }
        : null,
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

    // Automatically fetch and enroll all students belonging to this semester and department
    const matchingStudents = await prisma.student.findMany({
      where: {
        department: course.department,
        semester: course.semester,
      },
      select: { id: true },
    });

    if (matchingStudents.length > 0) {
      await prisma.enrollment.createMany({
        data: matchingStudents.map((st) => ({
          studentId: st.id,
          courseId: course.id,
          semester: course.semester,
        })),
        skipDuplicates: true,
      });
    }

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

export async function DELETE(request: NextRequest) {
  const denied = await requireRole(["ADMIN"]);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const semesterStr = searchParams.get("semester");
    const purgeAll = searchParams.get("all") === "true";

    const where: Prisma.CourseWhereInput = {};
    if (!purgeAll) {
      if (department && department !== "all") {
        where.department = department;
      }
      if (semesterStr && semesterStr !== "all") {
        where.semester = Number(semesterStr);
      }
    }

    const deleted = await prisma.course.deleteMany({
      where,
    });

    try {
      await prisma.auditLog.create({
        data: {
          action: "DELETED",
          entity: "Course",
          entityId: "PURGE_BULK",
          description: `Deleted ${deleted.count} course(s) [Dept: ${department || "All"}, Sem: ${semesterStr || "All"}]`,
        },
      });
    } catch {
      /* ignore */
    }

    return NextResponse.json({ deletedCount: deleted.count });
  } catch (error) {
    console.error("DELETE /api/courses error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}