import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getFacultyDashboardData } from "@/lib/services/faculty";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let data = await getFacultyDashboardData(userId);
    
    if (!data) {
      const fallbackFaculty = await prisma.user.findFirst({
        where: { role: "FACULTY" },
        select: { clerkId: true },
      });
      if (fallbackFaculty) {
        data = await getFacultyDashboardData(fallbackFaculty.clerkId);
      }
    }

    if (!data) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/dashboard/faculty error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
