import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { errorResponse, handleApiError } from "@/lib/api-errors";

// Helper to normalize a date to midnight UTC/local date
function getStartOfDay(dateString?: string | null): Date {
  const d = dateString ? new Date(dateString) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, faculty: { select: { id: true, department: true } } },
    });

    if (!dbUser) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const deptParam = searchParams.get("department");

    const targetDate = getStartOfDay(dateParam);

    if (dbUser.role === "FACULTY") {
      if (!dbUser.faculty) {
        return errorResponse("FORBIDDEN", "Faculty record not found", 403);
      }

      // Fetch faculty member's attendance for target date or past 30 days
      const records = await prisma.facultyAttendance.findMany({
        where: {
          facultyId: dbUser.faculty.id,
          ...(dateParam ? { date: targetDate } : {}),
        },
        orderBy: { date: "desc" },
        take: 30,
      });

      // Today's record check
      const today = getStartOfDay();
      const todayRecord = await prisma.facultyAttendance.findUnique({
        where: {
          facultyId_date: {
            facultyId: dbUser.faculty.id,
            date: today,
          },
        },
      });

      return NextResponse.json({
        todayRecord,
        history: records,
      });
    }

    if (dbUser.role === "ADMIN") {
      const startDate = getStartOfDay(dateParam);
      const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

      // Fetch all faculty members with their attendance for the 24h window around targetDate
      const allFaculty = await prisma.faculty.findMany({
        where: {
          ...(deptParam && deptParam !== "ALL"
            ? { department: { equals: deptParam, mode: "insensitive" } }
            : {}),
        },
        include: {
          user: { select: { name: true, email: true, avatar: true } },
          attendances: {
            where: {
              date: {
                gte: startDate,
                lt: endDate,
              },
            },
            orderBy: { date: "desc" },
            take: 1,
          },
        },
        orderBy: { user: { name: "asc" } },
      });

      const facultyStatusList = allFaculty.map((fac) => {
        const attendance = fac.attendances[0] ?? null;
        return {
          facultyId: fac.id,
          name: fac.user.name ?? fac.user.email,
          email: fac.user.email,
          avatar: fac.user.avatar,
          department: fac.department,
          specialization: fac.specialization,
          status: attendance ? attendance.status : "Absent",
          checkInTime: attendance?.checkInTime ?? null,
          checkOutTime: attendance?.checkOutTime ?? null,
          markedBy: attendance?.markedBy ?? "SYSTEM",
          notes: attendance?.notes ?? null,
          attendanceId: attendance?.id ?? null,
        };
      });

      return NextResponse.json({
        date: targetDate.toISOString(),
        faculty: facultyStatusList,
      });
    }

    return errorResponse("FORBIDDEN", "Access denied", 403);
  } catch (error) {
    return handleApiError("GET /api/faculty/attendance", error);
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, faculty: { select: { id: true } } },
    });

    if (!dbUser || dbUser.role !== "FACULTY" || !dbUser.faculty) {
      return errorResponse("FORBIDDEN", "Only faculty members can check in/out", 403);
    }

    const body = (await request.json()) as { action: "CHECK_IN" | "CHECK_OUT"; notes?: string };
    const today = getStartOfDay();
    const now = new Date();

    if (body.action === "CHECK_IN") {
      // Determine if Late based on time (e.g. after 09:15 AM)
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const isLate = currentHour > 9 || (currentHour === 9 && currentMinute > 15);

      const record = await prisma.facultyAttendance.upsert({
        where: {
          facultyId_date: {
            facultyId: dbUser.faculty.id,
            date: today,
          },
        },
        update: {
          checkInTime: now,
          status: isLate ? "Late" : "Present",
          notes: body.notes ?? undefined,
        },
        create: {
          facultyId: dbUser.faculty.id,
          date: today,
          status: isLate ? "Late" : "Present",
          checkInTime: now,
          markedBy: "SELF",
          notes: body.notes,
        },
      });

      return NextResponse.json({ success: true, record });
    }

    if (body.action === "CHECK_OUT") {
      const record = await prisma.facultyAttendance.update({
        where: {
          facultyId_date: {
            facultyId: dbUser.faculty.id,
            date: today,
          },
        },
        data: {
          checkOutTime: now,
        },
      });

      return NextResponse.json({ success: true, record });
    }

    return errorResponse("BAD_REQUEST", "Invalid action", 400);
  } catch (error) {
    return handleApiError("POST /api/faculty/attendance", error);
  }
}
