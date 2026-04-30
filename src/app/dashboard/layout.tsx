import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getRoleLabel } from "@/lib/sidebar-config";
import type { UserRole } from "@/types";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userId: string | null = null;

  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch (error) {
    console.error("Clerk auth() error:", error);
  }

  let role: UserRole = "student";

  if (userId) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: userId },
      });
      if (dbUser) {
        role = dbUser.role.toLowerCase() as UserRole;
      }
    } catch (dbError) {
      console.error("Database error fetching user role:", dbError);
    }
  }

  // Fallback for development/screenshot mode when Clerk is unlinked or unreachable
  if (!userId) {
    if (process.env.NODE_ENV === "production") {
      redirect("/sign-in");
    } else {
      const headersList = await headers();
      const url = headersList.get("referer") || headersList.get("x-url") || "";
      if (url.includes("/dashboard/admin")) role = "admin";
      else if (url.includes("/dashboard/faculty")) role = "faculty";
    }
  }

  const roleLabel = getRoleLabel(role);

  return (
    <DashboardShell role={role} roleLabel={roleLabel}>
      {children}
    </DashboardShell>
  );
}
