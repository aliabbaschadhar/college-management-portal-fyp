import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types";
import AdminDashboardHome from "@/components/dashboard/AdminDashboardHome";
import { StudentDashboardHome } from "@/components/dashboard/StudentDashboardHome";
import { FacultyDashboardHome } from "@/components/dashboard/FacultyDashboardHome";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const role = (user.publicMetadata?.role as UserRole) || "student";

  if (role === "faculty") {
    return <FacultyDashboardHome />;
  }

  if (role === "student") {
    return <StudentDashboardHome />;
  }

  // Default: admin
  return <AdminDashboardHome />;
}
