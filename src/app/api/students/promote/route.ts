import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAuditAction, getAdminName } from "@/lib/audit-log";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const authUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!authUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as {
      studentIds?: string[];
      department?: string;
      semester?: number;
      targetSemester: number;
      gradesheetUrl?: string;
    };

    if (!body || (!body.studentIds && (!body.department || !body.semester)) || !body.targetSemester) {
      return NextResponse.json({ error: "Missing required parameters (studentIds or department + semester, and targetSemester)" }, { status: 400 });
    }

    const targetSemester = Number(body.targetSemester);
    if (isNaN(targetSemester) || targetSemester < 1 || targetSemester > 9) {
      return NextResponse.json({ error: "targetSemester must be an integer between 1 and 9 (9 = Graduated)" }, { status: 400 });
    }

    const isGraduating = targetSemester === 9;

    // Resolve which students to promote
    let promoteStudentIds: string[] = [];
    if (body.studentIds && Array.isArray(body.studentIds)) {
      promoteStudentIds = body.studentIds;
    } else if (body.department && body.semester) {
      const studentsInClass = await prisma.student.findMany({
        where: {
          department: body.department,
          semester: Number(body.semester),
        },
        select: { id: true },
      });
      promoteStudentIds = studentsInClass.map((s) => s.id);
    }

    if (promoteStudentIds.length === 0) {
      return NextResponse.json({ success: true, promotedCount: 0, promotedStudents: [], message: "No students found to promote" });
    }

    const adminName = await getAdminName(userId);
    const results = [];
    const errors = [];

    // Process each student
    for (const studentId of promoteStudentIds) {
      try {
        const student = await prisma.student.findUnique({
          where: { id: studentId },
          select: {
            id: true,
            semester: true,
            department: true,
            rollNo: true,
            status: true,
            blocked: true,
            readmitRequested: true,
            fees: {
              where: { status: { in: ["Unpaid", "Overdue"] } },
              select: { amount: true, type: true, status: true },
            },
          },
        });

        if (!student) {
          errors.push(`Student ID ${studentId} not found`);
          continue;
        }

        if (isGraduating) {
          if (!body.gradesheetUrl) {
            errors.push(`Clearance Failed for ${student.rollNo}: Official 8-semester degree gradesheet (PDF or Image) must be uploaded`);
            continue;
          }

          if (student.status === "Graduated") {
            errors.push(`Student ${student.rollNo} is already Graduated`);
            continue;
          }

          if (student.blocked) {
            errors.push(`Clearance Failed for ${student.rollNo}: Student account is suspended/blocked`);
            continue;
          }

          if (student.readmitRequested) {
            errors.push(`Clearance Failed for ${student.rollNo}: Pending re-admission request must be resolved first`);
            continue;
          }

          if (student.fees && student.fees.length > 0) {
            const totalPending = student.fees.reduce((sum, f) => sum + f.amount, 0);
            errors.push(`Clearance Failed for ${student.rollNo}: Has ${student.fees.length} unpaid/overdue fee dues (Total: $${totalPending.toFixed(2)})`);
            continue;
          }

          const graduatedStudent = await prisma.$transaction(async (tx) => {
            const updated = await tx.student.update({
              where: { id: studentId },
              data: {
                status: "Graduated",
                semester: 8,
                gradesheetUrl: body.gradesheetUrl,
                graduationDate: new Date(),
              },
              include: { user: { select: { name: true } } },
            });
            await tx.enrollment.deleteMany({ where: { studentId: student.id } });
            return updated;
          });

          await logAuditAction({
            action: "UPDATED",
            entity: "Student",
            entityId: studentId,
            description: `Graduated student ${student.rollNo} from Semester 8 to Alumni status`,
            adminClerkId: userId,
            adminName,
          });

          results.push(graduatedStudent);
          continue;
        }

        if (student.semester === targetSemester && student.status === "Active") {
          errors.push(`Student ${student.rollNo} is already in Semester ${targetSemester}`);
          continue;
        }

        const updatedStudent = await prisma.$transaction(async (tx) => {
          // Promote semester
          const updated = await tx.student.update({
            where: { id: studentId },
            data: { semester: targetSemester, status: "Active" },
            include: { user: { select: { name: true } } },
          });

          // Clean up old semester enrollments
          await tx.enrollment.deleteMany({
            where: { studentId: student.id },
          });

          // Auto-enroll in target semester courses
          const courses = await tx.course.findMany({
            where: {
              department: student.department,
              semester: targetSemester,
            },
          });

          if (courses.length > 0) {
            await tx.enrollment.createMany({
              data: courses.map((c) => ({
                studentId: student.id,
                courseId: c.id,
                semester: targetSemester,
              })),
              skipDuplicates: true,
            });
          }

          return updated;
        });

        // Log audit action
        await logAuditAction({
          action: "UPDATED",
          entity: "Student",
          entityId: studentId,
          description: `Promoted student ${student.rollNo} from Semester ${student.semester} to Semester ${targetSemester} (Auto-enrolled in new courses)`,
          adminClerkId: userId,
          adminName,
        });

        results.push(updatedStudent);
      } catch (studentErr) {
        console.error(`Error promoting student ${studentId}:`, studentErr);
        errors.push(`Failed to promote student ${studentId}`);
      }
    }

    return NextResponse.json({
      success: true,
      promotedCount: results.length,
      promotedStudents: results.map((s) => ({
        id: s.id,
        rollNo: s.rollNo,
        name: s.user?.name,
        semester: s.semester,
        status: s.status,
      })),
      errors,
    });
  } catch (error) {
    console.error("POST /api/students/promote error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
