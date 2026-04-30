import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
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
    const { id } = await params;
    const body = (await request.json()) as {
      phone?: string;
      department?: string;
      semester?: number;
      avatar?: string;
    };

    const student = await prisma.student.update({
      where: { id },
      data: {
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(body.department !== undefined ? { department: body.department } : {}),
        ...(body.semester !== undefined ? { semester: body.semester } : {}),
        ...(body.avatar !== undefined ? { avatar: body.avatar } : {}),
      },
      include: { user: { select: { name: true } } },
    });

    if (userId) {
      try {
        const adminName = await getAdminName(userId);
        await logAuditAction({
          action: "UPDATED",
          entity: "Student",
          entityId: id,
          description: `Edited student profile: ${student.user.name ?? student.rollNo}`,
          adminClerkId: userId,
          adminName,
        });
      } catch (auditError) {
        console.error("Audit log failed:", auditError);
      }
    }

    return NextResponse.json(student);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    console.error("PATCH /api/students/[id] error:", error);
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
    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: { select: { name: true } } },
    });

    await prisma.student.delete({ where: { id } });

    if (userId && student) {
      try {
        const adminName = await getAdminName(userId);
        await logAuditAction({
          action: "DELETED",
          entity: "Student",
          entityId: id,
          description: `Deleted student: ${student.user.name ?? student.rollNo}`,
          adminClerkId: userId,
          adminName,
        });
      } catch (auditError) {
        console.error("Audit log failed:", auditError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    console.error("DELETE /api/students/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
