import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  const role = normalizeRole(clerkUser?.publicMetadata?.role);

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
  const { userId } = await auth();
  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // Owner always has access
  if (userId === ownerClerkId) {
    const clerkUser = await currentUser();
    const role = normalizeRole(clerkUser?.publicMetadata?.role) ?? "STUDENT";
    return { userId, role };
  }

  // Otherwise check role
  const clerkUser = await currentUser();
  const role = normalizeRole(clerkUser?.publicMetadata?.role);

  if (!role || !allowedRoles.includes(role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { userId, role };
}
