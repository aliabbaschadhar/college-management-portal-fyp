import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { Prisma } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireRole(["ADMIN"]);
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = (await request.json()) as { status: "Approved" | "Rejected" | "Pending" };

    // Validate status
    if (!body.status || !["Approved", "Rejected", "Pending"].includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be Approved, Rejected, or Pending" },
        { status: 400 }
      );
    }

    const admission = await prisma.admission.update({
      where: { id },
      data: { status: body.status },
    });

    return NextResponse.json(admission);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Admission not found" }, { status: 404 });
    }
    console.error("PATCH /api/admissions/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}