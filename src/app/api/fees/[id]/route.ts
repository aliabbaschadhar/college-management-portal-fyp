import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { FeeStatus, Prisma } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireRole(["ADMIN"]);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = (await request.json()) as { status: FeeStatus; paidDate?: string };

    const fee = await prisma.fee.update({
      where: { id },
      data: {
        status: body.status,
        ...(body.paidDate !== undefined ? { paidDate: new Date(body.paidDate) } : {}),
      },
    });

    return NextResponse.json(fee);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 });
    }
    console.error("PATCH /api/fees/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
