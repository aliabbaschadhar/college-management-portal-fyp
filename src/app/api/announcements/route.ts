import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AnnouncementAudience, Priority, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    // Load user role and student/faculty info to filter allowed audiences and targets
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        role: true,
        student: { select: { id: true, department: true, semester: true } },
        faculty: { select: { id: true, department: true } },
      },
    });

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = request.nextUrl;
    const requestedAudience = searchParams.get("audience") as AnnouncementAudience | null;

    // Determine allowed audiences based on role
    const allowedAudiences: AnnouncementAudience[] = ["All"];
    if (user.role === "STUDENT") {
      if (!user.student) {
        return NextResponse.json({ error: "Forbidden: Student profile not found" }, { status: 403 });
      }
      allowedAudiences.push("Students");
    }
    if (user.role === "FACULTY") allowedAudiences.push("Faculty");
    if (user.role === "ADMIN") allowedAudiences.push("Students", "Faculty");

    // Validate requested audience
    if (requestedAudience && !allowedAudiences.includes(requestedAudience)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const whereClause: Prisma.AnnouncementWhereInput = {
      ...(requestedAudience
        ? { audience: requestedAudience }
        : { audience: { in: allowedAudiences } }),
    };

    if (user.role === "STUDENT" && user.student) {
      const dept = user.student.department;
      const sem = user.student.semester;
      whereClause.OR = [
        { targetDepartment: null, targetSemester: null },
        { targetDepartment: dept, targetSemester: null },
        { targetDepartment: null, targetSemester: sem },
        { targetDepartment: dept, targetSemester: sem },
      ];
    } else if (user.role === "FACULTY" && user.faculty) {
      const dept = user.faculty.department;
      whereClause.OR = [
        { targetDepartment: null },
        { targetDepartment: dept },
      ];
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
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
      targetDepartment?: string | null;
      targetSemester?: number | null;
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
        targetDepartment: body.targetDepartment || null,
        targetSemester: body.targetSemester ? Number(body.targetSemester) : null,
      },
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error("POST /api/announcements error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}