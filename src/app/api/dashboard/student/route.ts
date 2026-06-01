import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStudentDashboardData } from "@/lib/services/student";
import { errorResponse, handleApiError } from "@/lib/api-errors";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    // Try to load dashboard data using local database first
    let data = await getStudentDashboardData(userId);

    if (!data) {
      // Fallback: Lazy load email from Clerk API to link the account if needed
      const clerkUser = await currentUser();
      if (clerkUser) {
        const primaryEmail =
          clerkUser.emailAddresses.find(
            (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId
          )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

        data = await getStudentDashboardData(userId, primaryEmail);
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
