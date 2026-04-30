import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserManagementClient } from "./UserManagementClient";

export default async function UsersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const role = clerkUser?.publicMetadata?.role as string | undefined;
  if (role?.toUpperCase() !== "ADMIN") redirect("/dashboard");

  return <UserManagementClient />;
}
