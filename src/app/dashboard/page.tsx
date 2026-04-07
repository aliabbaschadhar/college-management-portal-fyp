import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, LayoutDashboard, LogOut } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get user role from Clerk metadata (defaults to "student")
  const role =
    (user.publicMetadata?.role as string) || "student";

  const roleLabels: Record<string, string> = {
    student: "Student",
    faculty: "Faculty Member",
    admin: "Administrator",
  };

  const roleDescriptions: Record<string, string> = {
    student:
      "Access your courses, view grades, check attendance, and take quizzes.",
    faculty:
      "Manage your classes, create quizzes, track attendance, and view analytics.",
    admin:
      "Oversee admissions, manage records, generate timetables, and view reports.",
  };

  return (
    <div className="min-h-screen bg-light-blue">
      {/* Dashboard Header */}
      <header className="bg-primary-navy text-white shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-secondary-cyan" />
              <span className="text-lg font-bold">College Portal</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-block rounded-full bg-secondary-cyan/20 px-3 py-1 text-sm font-medium text-secondary-cyan">
                {roleLabels[role] || "User"}
              </span>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 ring-2 ring-secondary-cyan/50",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-grey">
            Welcome back, {user.firstName || "User"}!
          </h1>
          <p className="mt-2 text-dark-grey/70">
            {roleDescriptions[role] || "Welcome to the College Management Portal."}
          </p>
        </div>

        <div className="rounded-xl border border-soft-grey bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <LayoutDashboard className="h-6 w-6 text-primary-navy" />
            <h2 className="text-xl font-semibold text-dark-grey">
              Your Dashboard
            </h2>
          </div>
          <p className="text-dark-grey/70">
            Your personalized {roleLabels[role]?.toLowerCase() || "user"} dashboard
            is being set up. More features coming soon!
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {role === "student" && (
              <>
                <DashboardCard title="My Courses" count="—" />
                <DashboardCard title="Attendance" count="—" />
                <DashboardCard title="Quizzes" count="—" />
              </>
            )}
            {role === "faculty" && (
              <>
                <DashboardCard title="My Classes" count="—" />
                <DashboardCard title="Question Bank" count="—" />
                <DashboardCard title="Attendance" count="—" />
              </>
            )}
            {role === "admin" && (
              <>
                <DashboardCard title="Students" count="—" />
                <DashboardCard title="Faculty" count="—" />
                <DashboardCard title="Reports" count="—" />
              </>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-dark-grey/60 hover:text-primary-navy transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}

function DashboardCard({ title, count }: { title: string; count: string }) {
  return (
    <div className="rounded-lg border border-soft-grey bg-light-blue p-5 text-center transition-shadow hover:shadow-md">
      <p className="text-2xl font-bold text-primary-navy">{count}</p>
      <p className="mt-1 text-sm text-dark-grey/70">{title}</p>
    </div>
  );
}
