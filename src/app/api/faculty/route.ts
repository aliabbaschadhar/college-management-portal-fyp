import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const faculty = await prisma.faculty.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const result = faculty.map((f) => ({
      id: f.id,
      name: f.user.name,
      email: f.user.email,
      phone: f.phone,
      department: f.department,
      specialization: f.specialization,
      joinDate: f.joinDate.toISOString(),
      avatar: f.avatar,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/faculty error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as {
      userId: string;
      phone?: string;
      department: string;
      specialization: string;
    };

    const user = await prisma.user.findUnique({ where: { id: body.userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.role !== "FACULTY")
      return NextResponse.json({ error: "User is not a FACULTY" }, { status: 400 });

    const faculty = await prisma.faculty.create({
      data: {
        userId: body.userId,
        phone: body.phone,
        department: body.department,
        specialization: body.specialization,
      },
    });

    return NextResponse.json(faculty, { status: 201 });
  } catch (error) {
    console.error("POST /api/faculty error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
