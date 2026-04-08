import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

  const clerkUser = await currentUser();
  const role = clerkUser?.publicMetadata?.role as UserRole | undefined;

  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
