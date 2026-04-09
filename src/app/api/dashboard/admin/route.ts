import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAdminDashboardData } from "@/lib/services/admin";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const clerkUser = await currentUser();
    const role = clerkUser?.publicMetadata?.role as string | undefined;
    if (role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await getAdminDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/dashboard/admin error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
