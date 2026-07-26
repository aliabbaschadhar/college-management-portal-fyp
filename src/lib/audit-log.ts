import prisma from "@/lib/prisma";

export interface AuditLogParams {
  action: "CREATED" | "UPDATED" | "DELETED";
  entity: string;
  entityId: string;
  description: string;
  adminClerkId: string;
  adminName: string;
}

// Entities considered high-impact for audit logging
const HIGH_IMPACT_ENTITIES = new Set([
  "User",
  "Admission",
  "Fee",
  "Grade",
  "Onboarding",
  "SystemSettings",
  "Timetable",
  "Course",
  "Faculty",
  "Student",
]);

/**
 * Fire-and-forget audit logger.
 * Appends a row to the AuditLog table for high-impact admin actions.
 * Failures are logged but never bubble up to break the main operation.
 */
export async function logAuditAction(params: AuditLogParams): Promise<void> {
  // Filter out routine actions (e.g. routine Attendance micro-logs)
  if (!HIGH_IMPACT_ENTITIES.has(params.entity)) {
    return;
  }

  try {
    // Calculate expiration date (e.g., 90 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    // Check if the admin user exists in DB to prevent foreign key violation on adminId (AuditLog_adminId_fkey)
    let validAdminId: string | null = null;
    if (params.adminClerkId) {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: params.adminClerkId },
        select: { clerkId: true },
      });
      if (dbUser?.clerkId) {
        validAdminId = dbUser.clerkId;
      }
    }

    await prisma.auditLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        description: params.description,
        adminId: validAdminId,
        adminName: params.adminName,
        expiresAt,
      },
    });
  } catch (error) {
    console.error("[AuditLog] Failed to write audit entry:", error);
  }
}

/**
 * Retrieve the admin's display name from their Clerk ID.
 * Falls back to "Unknown Admin" if not found.
 */
export async function getAdminName(clerkId: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { name: true },
    });
    return user?.name ?? "Unknown Admin";
  } catch {
    return "Unknown Admin";
  }
}
