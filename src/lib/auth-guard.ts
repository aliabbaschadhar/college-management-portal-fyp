import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type UserRole = "ADMIN" | "FACULTY" | "STUDENT";

/**
 * Verifies the authenticated user has the required role.
 * Returns an error NextResponse if unauthorized, or null if the check passes.
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<NextResponse | null> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!dbUser || !allowedRoles.includes(dbUser.role)) {
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
  const { userId } = await auth();
  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!dbUser) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  // Owner always has access
  if (userId === ownerClerkId) {
    return { userId, role: dbUser.role };
  }

  // Otherwise check role
  if (!allowedRoles.includes(dbUser.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { userId, role: dbUser.role };
}
