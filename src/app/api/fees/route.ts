import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FeeStatus } from "@prisma/client";
import { ApiError, errorResponse, handleApiError, parseJsonBody } from "@/lib/api-errors";
import { logAuditAction, getAdminName } from "@/lib/audit-log";

interface FeeCreateBody {
  studentId: string;
  type: string;
  amount: number;
  dueDate: string;
  semester: number;
}

const FEE_STATUSES = new Set<FeeStatus>(["Paid", "Unpaid", "Overdue"]);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseValidDate(value: string, fieldName: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError("BAD_REQUEST", `${fieldName} must be a valid date`, 400);
  }
  return date;
}

function validateFeeBody(body: FeeCreateBody) {
  if (!isNonEmptyString(body.studentId)) {
    throw new ApiError("BAD_REQUEST", "studentId is required", 400);
  }
  if (!isNonEmptyString(body.type)) {
    throw new ApiError("BAD_REQUEST", "type is required", 400);
  }
  if (!Number.isFinite(body.amount) || body.amount <= 0) {
    throw new ApiError("BAD_REQUEST", "amount must be greater than 0", 400);
  }
  if (!Number.isInteger(body.semester) || body.semester < 1) {
    throw new ApiError("BAD_REQUEST", "semester must be an integer >= 1", 400);
  }
  parseValidDate(body.dueDate, "dueDate");
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    // Load user with role and student info
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, student: { select: { id: true } } },
    });

    if (!user) {
      const referer = request.headers.get("referer") || "";
      let fallbackRole: "STUDENT" | "FACULTY" | "ADMIN" = "STUDENT";
      if (referer.includes("/dashboard/admin")) fallbackRole = "ADMIN";
      else if (referer.includes("/dashboard/faculty")) fallbackRole = "FACULTY";

      user = await prisma.user.findFirst({
        where: { role: fallbackRole },
        select: { role: true, student: { select: { id: true } } },
      });
    }

    if (!user) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

    const { searchParams } = request.nextUrl;
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status") as FeeStatus | null;
    if (status && !FEE_STATUSES.has(status)) {
      return errorResponse("BAD_REQUEST", "Invalid fee status filter", 400);
    }

    // Build where clause based on role
    const isAdmin = user.role === "ADMIN";
    const isFaculty = user.role === "FACULTY";

    const resolvedStudentId = studentId
      ? studentId
      : !isAdmin && !isFaculty
        ? user.student?.id
        : undefined;

    if (studentId) {
      // If specific studentId requested, verify permissions
      if (!isAdmin && !isFaculty) {
        // Students can only view their own fees
        if (!user.student || user.student.id !== studentId) {
          return errorResponse("FORBIDDEN", "Forbidden", 403);
        }
      }
    } else {
      // No studentId specified
      if (!isAdmin && !isFaculty) {
        // Students must filter by their own ID
        if (!user.student) {
          return errorResponse("FORBIDDEN", "Forbidden", 403);
        }
      }
    }

    const whereClause: { studentId?: string; status?: FeeStatus } = {
      ...(status ? { status } : {}),
      ...(resolvedStudentId ? { studentId: resolvedStudentId } : {}),
    };

    // Auto-detect overdue fees: update unpaid fees past their due date
    await prisma.fee.updateMany({
      where: {
        status: "Unpaid",
        dueDate: { lt: new Date() },
        ...whereClause,
      },
      data: { status: "Overdue" },
    });

    const fees = await prisma.fee.findMany({
      where: whereClause,
      include: {
        student: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { dueDate: "desc" },
    });

    return NextResponse.json(fees);
  } catch (error) {
    return handleApiError("GET /api/fees", error);
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    // Only admin can create fees
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return errorResponse("FORBIDDEN", "Only administrators can create fee records", 403);
    }

    const body = await parseJsonBody<FeeCreateBody>(request);
    validateFeeBody(body);
    const dueDate = parseValidDate(body.dueDate, "dueDate");

    const fee = await prisma.fee.create({
      data: {
        studentId: body.studentId,
        type: body.type,
        amount: body.amount,
        dueDate,
        semester: body.semester,
      },
      include: {
        student: { include: { user: { select: { name: true } } } },
      },
    });

    const adminName = await getAdminName(userId);
    await logAuditAction({
      action: "CREATED",
      entity: "Fee",
      entityId: fee.id,
      description: `Created ${body.type} of Rs. ${body.amount.toLocaleString()} for ${fee.student.user.name ?? "Unknown Student"}`,
      adminClerkId: userId,
      adminName,
    });

    return NextResponse.json(fee, { status: 201 });
  } catch (error) {
    return handleApiError("POST /api/fees", error);
  }
}