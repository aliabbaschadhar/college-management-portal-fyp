import { auth } from "@clerk/nextjs/server";
import { getStudentDashboardData } from "@/lib/services/student";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const data = await getStudentDashboardData(userId);
    if (!data) {
      return new Response("Student profile not found", { status: 404 });
    }
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
