import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { errorResponse, handleApiError } from "@/lib/api-errors";

export async function GET(request: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  const metadata = sessionClaims?.metadata as Record<string, unknown> | undefined;
  let role = typeof metadata?.role === "string" ? metadata.role.toUpperCase() : undefined;

  if (!role) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });
    role = dbUser?.role;
  }

  if (role !== "ADMIN") {
    return errorResponse("FORBIDDEN", "Admin access required", 403);
  }

  try {
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");
    const search = searchParams.get("search") ?? "";

    const users = await prisma.user.findMany({
      where: {
        ...(roleFilter && roleFilter !== "ALL"
          ? { role: roleFilter as "ADMIN" | "FACULTY" | "STUDENT" }
          : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        student: { select: { rollNo: true, department: true } },
        faculty: { select: { phone: true, department: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      users.map((u) => ({
        id: u.id,
        clerkId: u.clerkId,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
        student: u.student
          ? { rollNo: u.student.rollNo, department: u.student.department }
          : null,
        faculty: u.faculty
          ? { department: u.faculty.department }
          : null,
      }))
    );
  } catch (error) {
    return handleApiError("GET /api/users", error);
  }
}
