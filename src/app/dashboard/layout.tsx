import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getRoleLabel } from "@/lib/sidebar-config";
import type { UserRole } from "@/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const role = (user.publicMetadata?.role as UserRole) || "student";
  const roleLabel = getRoleLabel(role);

  return (
    <DashboardShell role={role} roleLabel={roleLabel}>
      {children}
    </DashboardShell>
  );
}
