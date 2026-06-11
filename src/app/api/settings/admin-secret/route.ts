import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { handleApiError } from "@/lib/api-errors";

function generateSecretKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GGC-${result}`;
}

export async function GET() {
  const denied = await requireRole(["ADMIN"]);
  if (denied) return denied;

  try {
    const dbSettings = await prisma.systemSettings.findUnique({
      where: { key: "admin_onboarding_secret" },
    });
    
    if (!dbSettings) {
      return NextResponse.json({ secret: "" });
    }
    
    const now = Date.now();
    const updatedAtTime = new Date(dbSettings.updatedAt).getTime();
    const isExpired = now - updatedAtTime > 5 * 60 * 1000;
    
    if (isExpired) {
      return NextResponse.json({ secret: "" });
    }
    
    const expiresAt = new Date(updatedAtTime + 5 * 60 * 1000).toISOString();
    return NextResponse.json({
      secret: dbSettings.value,
      expiresAt,
    });
  } catch (error) {
    return handleApiError("GET /api/settings/admin-secret", error);
  }
}

export async function POST() {
  const denied = await requireRole(["ADMIN"]);
  if (denied) return denied;

  try {
    const generatedSecret = generateSecretKey();
    const now = new Date();

    const settings = await prisma.systemSettings.upsert({
      where: { key: "admin_onboarding_secret" },
      update: { value: generatedSecret, updatedAt: now },
      create: { key: "admin_onboarding_secret", value: generatedSecret },
    });

    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

    return NextResponse.json({
      success: true,
      secret: settings.value,
      expiresAt,
    });
  } catch (error) {
    return handleApiError("POST /api/settings/admin-secret", error);
  }
}
