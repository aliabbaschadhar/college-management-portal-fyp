import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { errorResponse, handleApiError } from "@/lib/api-errors";

export async function GET() {
  const denied = await requireRole(["ADMIN"]);
  if (denied) return denied;

  try {
    const dbSettings = await prisma.systemSettings.findUnique({
      where: { key: "admin_onboarding_secret" },
    });
    
    return NextResponse.json({
      secret: dbSettings?.value || "GGC-ADMIN-SECRET-2026",
    });
  } catch (error) {
    return handleApiError("GET /api/settings/admin-secret", error);
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireRole(["ADMIN"]);
  if (denied) return denied;

  try {
    const body = (await request.json()) as { secret?: string };
    const { secret } = body;

    if (!secret || !secret.trim()) {
      return errorResponse("BAD_REQUEST", "Secret key cannot be empty", 400);
    }

    const settings = await prisma.systemSettings.upsert({
      where: { key: "admin_onboarding_secret" },
      update: { value: secret.trim() },
      create: { key: "admin_onboarding_secret", value: secret.trim() },
    });

    return NextResponse.json({
      success: true,
      secret: settings.value,
    });
  } catch (error) {
    return handleApiError("POST /api/settings/admin-secret", error);
  }
}
