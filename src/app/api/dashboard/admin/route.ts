import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getAdminDashboardData } from "@/lib/services/admin";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const programLevel = req.nextUrl.searchParams.get("programLevel") || "BS";

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parallelize the dashboard data aggregation and recent audit logs query
    const [data, recentAuditLogs] = await Promise.all([
      getAdminDashboardData(programLevel),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      ...data,
      recentAuditLogs,
    });
  } catch (error) {
    console.error("GET /api/dashboard/admin error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
