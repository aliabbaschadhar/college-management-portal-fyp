import prisma from "@/lib/prisma";

export interface AuditLogParams {
  action: "CREATED" | "UPDATED" | "DELETED";
  entity: string;
  entityId: string;
  description: string;
  adminClerkId: string;
  adminName: string;
}

/**
 * Fire-and-forget audit logger.
 * Appends a row to the AuditLog table for every admin mutation.
 * Failures are logged but never bubble up to break the main operation.
 */
export async function logAuditAction(params: AuditLogParams): Promise<void> {
  try {
    // Calculate expiration date (e.g., 90 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    await prisma.auditLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        description: params.description,
        adminId: params.adminClerkId,
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
