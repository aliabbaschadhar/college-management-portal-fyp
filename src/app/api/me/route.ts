import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { errorResponse, handleApiError } from "@/lib/api-errors";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        student: true,
        faculty: true,
        admin: true,
      },
    });

    if (!user) return errorResponse("NOT_FOUND", "User not found", 404);

    return NextResponse.json({
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
    return handleApiError("GET /api/me", error);
  }
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    const body = (await request.json()) as { name?: string; phone?: string };
    const { name, phone } = body;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { student: true, faculty: true },
    });

    if (!user) return errorResponse("NOT_FOUND", "User not found", 404);

    // Update base user name
    const updated = await prisma.user.update({
      where: { clerkId: userId },
      data: { ...(name !== undefined ? { name } : {}) },
    });

    // Propagate phone to role-specific profile
    if (phone !== undefined) {
      if (user.student) {
        await prisma.student.update({
          where: { userId: user.id },
          data: { phone },
        });
      } else if (user.faculty) {
        await prisma.faculty.update({
          where: { userId: user.id },
          data: { phone },
        });
      }
    }

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    });
  } catch (error) {
    return handleApiError("PATCH /api/me", error);
  }
}
