import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { SettingsTabs } from "./SettingsTabs";

/**
 * Settings page — Server Component wrapper.
 * Fetches the full profile record to power the split-panel settings UI.
 * Falls back to Clerk user data if the DB is unreachable.
 */
export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        student: {
          select: { phone: true, department: true, rollNo: true },
        },
        faculty: {
          select: { phone: true, department: true },
        },
      },
    });

    if (!dbUser) {
      // Fallback: use Clerk user directly if DB record missing
      const clerkUser = await currentUser();
      if (!clerkUser) redirect("/sign-in");

      const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
      const name = [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ");

      return (
        <SettingsTabs
          user={{
            id: userId,
            name: name || null,
            email,
            role: "STUDENT",
            student: null,
            faculty: null,
          }}
        />
      );
    }

    return (
      <SettingsTabs
        user={{
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
          student: dbUser.student,
          faculty: dbUser.faculty,
        }}
      />
    );
  } catch (err) {
    console.error("[Settings] Database error — using Clerk fallback:", err);

    // DB is unreachable — show settings with Clerk user data
    const clerkUser = await currentUser();
    if (!clerkUser) redirect("/sign-in");

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const name = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ");

    return (
      <SettingsTabs
        user={{
          id: userId,
          name: name || null,
          email,
          role: "STUDENT",
          student: null,
          faculty: null,
        }}
      />
    );
  }
}
