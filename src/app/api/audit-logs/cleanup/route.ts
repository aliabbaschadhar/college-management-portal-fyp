import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  // Check authorization header for CRON secret if using Vercel/system CRON
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else {
    // If no CRON_SECRET is configured in environment, require an authenticated ADMIN session
    const denied = await requireRole(["ADMIN"]);
    if (denied) return denied;
  }

  try {
    // Redact sensitive data from expired logs
    // We are setting adminName and description to [REDACTED] to preserve the action history but remove PII
    const result = await prisma.auditLog.updateMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
        description: {
          not: "[REDACTED]",
        },
      },
      data: {
        adminName: "[REDACTED]",
        description: "[REDACTED]",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully redacted ${result.count} expired audit logs.`,
    });
  } catch (error) {
    console.error("Failed to cleanup audit logs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
