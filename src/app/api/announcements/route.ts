import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AnnouncementAudience, Priority } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = request.nextUrl;
    const audience = searchParams.get("audience") as AnnouncementAudience | null;

    const announcements = await prisma.announcement.findMany({
      where: { ...(audience ? { audience } : {}) },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("GET /api/announcements error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as {
      title: string;
      content: string;
      author: string;
      audience: AnnouncementAudience;
      priority: Priority;
    };

    const announcement = await prisma.announcement.create({
      data: {
        title: body.title,
        content: body.content,
        author: body.author,
        audience: body.audience,
        priority: body.priority,
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("POST /api/announcements error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
