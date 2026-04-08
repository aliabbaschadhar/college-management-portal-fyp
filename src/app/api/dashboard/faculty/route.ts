import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getFacultyDashboardData } from "@/lib/services/faculty";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const clerkUser = await currentUser();
    const role = clerkUser?.publicMetadata?.role as string | undefined;
    if (role !== "FACULTY") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await getFacultyDashboardData(userId);
    if (!data) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/dashboard/faculty error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
