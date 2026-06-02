import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminDashboardHome from "@/components/dashboard/AdminDashboardHome";
import { StudentDashboardHome } from "@/components/dashboard/StudentDashboardHome";
import { FacultyDashboardHome } from "@/components/dashboard/FacultyDashboardHome";

type Role = "admin" | "faculty" | "student";

function getRoleFromClaims(
  sessionClaims: Record<string, unknown> | null | undefined
): Role | null {
  const metadata =
    (sessionClaims?.metadata as { role?: unknown }) ??
    (sessionClaims?.public_metadata as { role?: unknown });
  const roleValue = metadata?.role;
  if (typeof roleValue !== "string") return null;
  const normalized = roleValue.toLowerCase();
  if (
    normalized === "admin" ||
    normalized === "faculty" ||
    normalized === "student"
  ) {
    return normalized as Role;
  }
  return null;
}

export default async function DashboardPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Default role — will be overridden by DB lookup or Clerk claims
  let role: Role = "student";

  try {
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!dbUser) {
      // Webhook fallback: Fetch user from Clerk and auto-create/link in local DB
      const clerkUser = await currentUser();
      if (!clerkUser) {
        redirect("/sign-in");
      }

      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const name = [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ");

      // Check if user already exists by email (e.g., mock seeded account)
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Link the clerkId
        dbUser = await prisma.user.update({
          where: { email },
          data: { clerkId: userId },
          select: { role: true },
        });

        // Sync the role back to Clerk's publicMetadata
        try {
          const client = await clerkClient();
          await client.users.updateUserMetadata(userId, {
            publicMetadata: { role: dbUser.role.toLowerCase() },
          });
        } catch (clerkErr) {
          console.error(
            "Clerk metadata sync failed during fallback:",
            clerkErr
          );
        }
      } else {
        // Create a new user (default to STUDENT)
        dbUser = await prisma.user.create({
          data: {
            clerkId: userId,
            email,
            name,
            role: "STUDENT",
            student: {
              create: {
                rollNo: `ST-${userId
                  .replace("user_", "")
                  .substring(0, 8)
                  .toUpperCase()}`,
                department: "Computer Science",
                semester: 1,
              },
            },
          },
          select: { role: true },
        });
      }
    }

    role = dbUser.role.toLowerCase() as Role;
  } catch (err) {
    // DB is unreachable (cold start timeout, network issue, etc.)
    // Fall back to role stored in Clerk session claims — do NOT redirect to sign-in
    console.error(
      "[Dashboard] Database error — falling back to Clerk session claims:",
      err
    );
    const claimsRole = getRoleFromClaims(
      sessionClaims as Record<string, unknown>
    );
    if (claimsRole) {
      role = claimsRole;
    }
    // Keep default "student" if claims are also unavailable
  }

  if (role === "faculty") {
    return <FacultyDashboardHome />;
  }

  if (role === "student") {
    return <StudentDashboardHome />;
  }

  // Default: admin
  return <AdminDashboardHome />;
}
