import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { UserManagementClient } from "./UserManagementClient";

export default async function UsersPage() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    // If DB returned a result and user isn't admin, redirect them away
    if (dbUser && dbUser.role !== "ADMIN") redirect("/dashboard");

    // If DB had no record, fall back to Clerk claims
    if (!dbUser) {
      const claimsRole = (
        sessionClaims as { metadata?: { role?: string }; public_metadata?: { role?: string } }
      )?.metadata?.role ?? (
        sessionClaims as { metadata?: { role?: string }; public_metadata?: { role?: string } }
      )?.public_metadata?.role;

      if (claimsRole?.toUpperCase() !== "ADMIN") redirect("/dashboard");
    }
  } catch (err) {
    console.error("[Users] Database error — using Clerk session fallback:", err);

    // Fall back to Clerk session claims for role check
    const claimsRole = (
      sessionClaims as { metadata?: { role?: string }; public_metadata?: { role?: string } }
    )?.metadata?.role ?? (
      sessionClaims as { metadata?: { role?: string }; public_metadata?: { role?: string } }
    )?.public_metadata?.role;

    if (claimsRole?.toUpperCase() !== "ADMIN") redirect("/dashboard");
  }

  return <UserManagementClient />;
}
