import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const clerkUser = await currentUser();
    const role = clerkUser?.publicMetadata?.role as string | undefined;
    if (role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json()) as { locked: boolean };

    const grade = await prisma.grade.update({
      where: { id },
      data: { locked: body.locked },
    });

    return NextResponse.json(grade);
  } catch (error) {
    console.error("PATCH /api/grades/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
