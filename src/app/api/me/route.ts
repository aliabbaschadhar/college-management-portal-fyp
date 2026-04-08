import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        student: true,
        faculty: true,
        admin: true,
      },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    return Response.json({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      role: user.role,
      student: user.student,
      faculty: user.faculty,
      admin: user.admin,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
