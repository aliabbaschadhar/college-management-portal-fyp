import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProfileQRCode } from "@/components/dashboard/ProfileQRCode";
import { SettingsTabs } from "./SettingsTabs";

/**
 * Settings page — Server Component wrapper.
 * Fetches the authenticated user's Postgres record to obtain
 * the stable User.id used to build the public QR verification URL.
 */
export default async function SettingsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      {/* QR Code section — always visible at top of settings */}
      {dbUser && (
        <ProfileQRCode
          userId={dbUser.id}
          userName={dbUser.name ?? clerkUser.firstName ?? "User"}
        />
      )}

      {/* Rest of settings (client interactive tabs) */}
      <SettingsTabs />
    </div>
  );
}
