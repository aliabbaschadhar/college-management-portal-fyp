import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { Prisma } from "@prisma/client";
import { logAuditAction, getAdminName } from "@/lib/audit-log";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireRole(["ADMIN"]);
  if (denied) return denied;

  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = (await request.json()) as { status: "Approved" | "Rejected" | "Pending" };

    if (!body.status || !["Approved", "Rejected", "Pending"].includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be Approved, Rejected, or Pending" },
        { status: 400 }
      );
    }

    const admission = await prisma.admission.update({
      where: { id },
      data: { status: body.status },
    });

    const adminName = await getAdminName(userId);

    // Auto-provision Student + User + Fees when approved
    if (body.status === "Approved") {
      try {
        // Check if a user with this email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: admission.email },
          include: { student: true },
        });

        if (!existingUser) {
          // Create User + Student + initial fees in a transaction
          await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
              data: {
                email: admission.email,
                name: admission.studentName,
                role: "STUDENT",
              },
            });

            if (!admission.appliedDepartment) throw new Error("Missing appliedDepartment");
            const safeDept = admission.appliedDepartment.length >= 2 ? admission.appliedDepartment.substring(0, 2).toUpperCase() : "XX";
            const rollNo = `${safeDept}-${new Date().getFullYear()}-${admission.id.substring(0, 8).toUpperCase()}`;

            const student = await tx.student.create({
              data: {
                userId: newUser.id,
                rollNo,
                phone: admission.phone,
                department: admission.appliedDepartment,
                semester: 1,
              },
            });

            // Create initial fees
            const currentYear = new Date().getFullYear();
            await tx.fee.createMany({
              data: [
                {
                  studentId: student.id,
                  type: "Tuition Fee",
                  amount: 45000,
                  dueDate: new Date(`${currentYear}-09-01`),
                  semester: 1,
                },
                {
                  studentId: student.id,
                  type: "Admission Fee",
                  amount: 15000,
                  dueDate: new Date(`${currentYear}-08-01`),
                  semester: 1,
                },
              ],
            });
          });

          try {
            await logAuditAction({
              action: "UPDATED",
              entity: "Admission",
              entityId: id,
              description: `Approved admission for ${admission.studentName} — Student record, roll number, and initial fees auto-created`,
              adminClerkId: userId,
              adminName,
            });
          } catch (auditError) {
            console.error("Audit log failed:", auditError);
          }
        } else {
          try {
            await logAuditAction({
              action: "UPDATED",
              entity: "Admission",
              entityId: id,
              description: `Approved admission for ${admission.studentName} — User already exists, skipped auto-creation`,
              adminClerkId: userId,
              adminName,
            });
          } catch (auditError) {
            console.error("Audit log failed:", auditError);
          }
        }
      } catch (provisionError) {
        console.error("Auto-provision error:", provisionError);
        // Don't fail the status update — just log
        try {
          await logAuditAction({
            action: "UPDATED",
            entity: "Admission",
            entityId: id,
            description: `Approved admission for ${admission.studentName} — Auto-provisioning failed, manual setup needed`,
            adminClerkId: userId,
            adminName,
          });
        } catch (auditError) {
          console.error("Audit log failed:", auditError);
        }
      }
    } else {
      try {
        await logAuditAction({
          action: "UPDATED",
          entity: "Admission",
          entityId: id,
          description: `Changed admission status for ${admission.studentName} to ${body.status}`,
          adminClerkId: userId,
          adminName,
        });
      } catch (auditError) {
        console.error("Audit log failed:", auditError);
      }
    }

    return NextResponse.json(admission);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Admission not found" }, { status: 404 });
    }
    console.error("PATCH /api/admissions/[id] error:", error);
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
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const admission = await prisma.admission.findUnique({ where: { id } });
    if (!admission) {
      return NextResponse.json({ error: "Admission not found" }, { status: 404 });
    }

    if (admission.status === "Approved") {
      return NextResponse.json(
        { error: "Cannot delete an approved admission. Reject it first." },
        { status: 400 }
      );
    }

    await prisma.admission.delete({ where: { id } });

    try {
      const adminName = await getAdminName(userId);
      await logAuditAction({
        action: "DELETED",
        entity: "Admission",
        entityId: id,
        description: `Deleted ${admission.status} admission for ${admission.studentName}`,
        adminClerkId: userId,
        adminName,
      });
    } catch (auditError) {
      console.error("Audit log failed:", auditError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admissions/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}