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
      specialization?: string;
      avatar?: string;
    };

    const faculty = await prisma.faculty.update({
      where: { id },
      data: {
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(body.department !== undefined ? { department: body.department } : {}),
        ...(body.specialization !== undefined ? { specialization: body.specialization } : {}),
        ...(body.avatar !== undefined ? { avatar: body.avatar } : {}),
      },
      include: { user: { select: { name: true } } },
    });

    if (userId) {
      const adminName = await getAdminName(userId);
      await logAuditAction({
        action: "UPDATED",
        entity: "Faculty",
        entityId: id,
        description: `Edited faculty profile: ${faculty.user.name ?? "Unknown"}`,
        adminClerkId: userId,
        adminName,
      });
    }

    return NextResponse.json(faculty);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }
    console.error("PATCH /api/faculty/[id] error:", error);
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

    const faculty = await prisma.faculty.findUnique({
      where: { id },
      include: { user: { select: { name: true } } },
    });

    await prisma.faculty.delete({ where: { id } });

    if (userId && faculty) {
      const adminName = await getAdminName(userId);
      await logAuditAction({
        action: "DELETED",
        entity: "Faculty",
        entityId: id,
        description: `Deleted faculty: ${faculty.user.name ?? "Unknown"}`,
        adminClerkId: userId,
        adminName,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }
    console.error("DELETE /api/faculty/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
