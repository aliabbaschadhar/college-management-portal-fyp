import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FeeStatus } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    console.error("PATCH /api/fees/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
