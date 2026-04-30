import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStudentDashboardData } from "@/lib/services/student";
import { errorResponse, handleApiError } from "@/lib/api-errors";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    const clerkUser = await currentUser();
    const primaryEmail =
      clerkUser?.emailAddresses.find(
        (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId
      )?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress;

    let data = await getStudentDashboardData(userId, primaryEmail);
    
    if (!data) {
      const fallbackStudent = await prisma.user.findFirst({
        where: { role: "STUDENT" },
        select: { clerkId: true, email: true },
      });
      if (fallbackStudent) {
        data = await getStudentDashboardData(fallbackStudent.clerkId, fallbackStudent.email);
      }
    }

    if (!data) {
      return errorResponse("NOT_FOUND", "Student profile not found", 404);
    }
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError("GET /api/dashboard/student", error);
  }
}
