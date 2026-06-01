import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminDashboardHome from "@/components/dashboard/AdminDashboardHome";
import { StudentDashboardHome } from "@/components/dashboard/StudentDashboardHome";
import { FacultyDashboardHome } from "@/components/dashboard/FacultyDashboardHome";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  if (!dbUser) {
    redirect("/sign-in");
  }

  const role = dbUser.role.toLowerCase();

  if (role === "faculty") {
    return <FacultyDashboardHome />;
  }

  if (role === "student") {
    return <StudentDashboardHome />;
  }

  // Default: admin
  return <AdminDashboardHome />;
}
