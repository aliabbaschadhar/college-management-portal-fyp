import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AnnouncementAudience, Priority } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Load user role to filter allowed audiences
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const requestedAudience = searchParams.get("audience") as AnnouncementAudience | null;

    // Determine allowed audiences based on role
    const allowedAudiences: AnnouncementAudience[] = ["All"];
    if (user.role === "STUDENT") allowedAudiences.push("Students");
    if (user.role === "FACULTY") allowedAudiences.push("Faculty");
    if (user.role === "ADMIN") allowedAudiences.push("Students", "Faculty");

    // Validate requested audience
    if (requestedAudience && !allowedAudiences.includes(requestedAudience)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const announcements = await prisma.announcement.findMany({
      where: {
        ...(requestedAudience
          ? { audience: requestedAudience }
          : { audience: { in: allowedAudiences } }),
      },
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
    // Load user to get name and role
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, name: true },
    });

    if (!user || !["ADMIN", "FACULTY"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as {
      title: string;
      content: string;
      audience: AnnouncementAudience;
      priority: Priority;
    };

    // Validate audience allowed for this role
    const allowedAudiences: AnnouncementAudience[] = ["All"];
    if (user.role === "ADMIN") allowedAudiences.push("Students", "Faculty");
    if (user.role === "FACULTY") allowedAudiences.push("Students");

    if (!allowedAudiences.includes(body.audience)) {
      return NextResponse.json({ error: "Forbidden: Cannot post to this audience" }, { status: 403 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: body.title,
        content: body.content,
        author: user.name || "Unknown",
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