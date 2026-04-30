import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAdminDashboardData } from "@/lib/services/admin";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await getAdminDashboardData();

    // Fetch recent audit log entries for admin dashboard
    const recentAuditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      ...data,
      recentAuditLogs,
    });
  } catch (error) {
    console.error("GET /api/dashboard/admin error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
