import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getStudentDashboardData } from "@/lib/services/student";
import { errorResponse, handleApiError } from "@/lib/api-errors";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    const data = await getStudentDashboardData(userId);
    if (!data) {
      return errorResponse("NOT_FOUND", "Student profile not found", 404);
    }
    return NextResponse.json(data);
  } catch (error) {
    return handleApiError("GET /api/dashboard/student", error);
  }
}
