import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type UserRole = "ADMIN" | "FACULTY" | "STUDENT";

function normalizeRole(rawRole: unknown): UserRole | undefined {
  if (typeof rawRole !== "string") return undefined;
  const upper = rawRole.toUpperCase() as UserRole;
  return upper === "ADMIN" || upper === "FACULTY" || upper === "STUDENT" ? upper : undefined;
}

/**
 * Verifies the authenticated user has the required role.
 * Returns an error NextResponse if unauthorized, or null if the check passes.
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<NextResponse | null> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Try to get role from sessionClaims (JWT metadata) first to avoid external network requests
  const metadata = sessionClaims?.metadata as Record<string, unknown> | undefined;
  let rawRole = typeof metadata?.role === "string" ? metadata.role : undefined;

  // 2. Fallback to database user query
  if (!rawRole) {
    const isDbDown = (globalThis as unknown as { isDbDown?: boolean }).isDbDown;
    if (isDbDown) {
      return NextResponse.json({ error: "Database temporarily unavailable", code: "DATABASE_ERROR" }, { status: 503 });
    }
    try {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { role: true },
      });
      const isDbDownAfter = (globalThis as unknown as { isDbDown?: boolean }).isDbDown;
      if (isDbDownAfter) {
        return NextResponse.json({ error: "Database temporarily unavailable", code: "DATABASE_ERROR" }, { status: 503 });
      }
      rawRole = dbUser?.role;
    } catch {
      return NextResponse.json({ error: "Database temporarily unavailable", code: "DATABASE_ERROR" }, { status: 503 });
    }
  }

  const role = normalizeRole(rawRole);

  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

/**
 * Allows access if the current user is the resource owner (by clerkId match)
 * OR has one of the allowed roles (e.g. ADMIN).
 * Returns { error: NextResponse } if unauthorized, or { userId, role } if permitted.
 */
export async function requireOwnerOrRole(
  ownerClerkId: string,
  allowedRoles: UserRole[]
): Promise<{ error: NextResponse } | { userId: string; role: UserRole }> {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // Get role from sessionClaims or database
  const metadata = sessionClaims?.metadata as Record<string, unknown> | undefined;
  let rawRole = typeof metadata?.role === "string" ? metadata.role : undefined;

  if (!rawRole) {
    const isDbDown = (globalThis as unknown as { isDbDown?: boolean }).isDbDown;
    if (isDbDown) {
      return { error: NextResponse.json({ error: "Database temporarily unavailable", code: "DATABASE_ERROR" }, { status: 503 }) };
    }
    try {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { role: true },
      });
      const isDbDownAfter = (globalThis as unknown as { isDbDown?: boolean }).isDbDown;
      if (isDbDownAfter) {
        return { error: NextResponse.json({ error: "Database temporarily unavailable", code: "DATABASE_ERROR" }, { status: 503 }) };
      }
      rawRole = dbUser?.role;
    } catch {
      return { error: NextResponse.json({ error: "Database temporarily unavailable", code: "DATABASE_ERROR" }, { status: 503 }) };
    }
  }

  const role = normalizeRole(rawRole) ?? "STUDENT";

  // Owner always has access
  if (userId === ownerClerkId) {
    return { userId, role };
  }

  if (!allowedRoles.includes(role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { userId, role };
}
