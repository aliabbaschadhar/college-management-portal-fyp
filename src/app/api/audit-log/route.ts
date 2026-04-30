import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const denied = await requireRole(["ADMIN"]);
  if (denied) return denied;

  try {
    const { searchParams } = request.nextUrl;
    const entity = searchParams.get("entity");
    const entityId = searchParams.get("entityId");

    const whereClause: { entity?: string; entityId?: string } = {};
    if (entity) whereClause.entity = entity;
    if (entityId) whereClause.entityId = entityId;

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET /api/audit-log error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
