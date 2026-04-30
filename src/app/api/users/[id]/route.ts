import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { logAuditAction, getAdminName } from "@/lib/audit-log";

type AllowedRole = "ADMIN" | "FACULTY" | "STUDENT";
const ALLOWED_ROLES: AllowedRole[] = ["ADMIN", "FACULTY", "STUDENT"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireRole(["ADMIN"]);
  if (denied) return denied;

  try {
    const { userId: adminClerkId } = await auth();
    if (!adminClerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as { role?: string };
    const newRole = body.role?.toUpperCase() as AllowedRole | undefined;

    if (!newRole || !ALLOWED_ROLES.includes(newRole)) {
      return NextResponse.json(
        { error: "Invalid role. Must be ADMIN, FACULTY, or STUDENT" },
        { status: 400 }
      );
    }

    // Find the target user
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Block self-role change
    if (targetUser.clerkId === adminClerkId) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 403 }
      );
    }

    const previousRole = targetUser.role;

    // Update Prisma
    const updated = await prisma.user.update({
      where: { id },
      data: { role: newRole },
    });

    // Sync Clerk publicMetadata
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(targetUser.clerkId, {
        publicMetadata: { role: newRole.toLowerCase() },
      });
    } catch (clerkErr) {
      console.error("[users/[id]] Clerk metadata sync failed:", clerkErr);
      // Non-fatal — Prisma is source of truth; warn but continue
    }

    // Audit log
    const adminClerkUser = await currentUser();
    const adminName = adminClerkUser?.fullName ?? (await getAdminName(adminClerkId));
    void logAuditAction({
      action: "UPDATED",
      entity: "User",
      entityId: id,
      description: `Role changed from ${previousRole} to ${newRole} for ${targetUser.name ?? targetUser.email}`,
      adminClerkId,
      adminName,
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    });
  } catch (error) {
    console.error("[PATCH /api/users/[id]] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
