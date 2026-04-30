import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { FeedbackType, Prisma } from "@prisma/client";
import { ApiError, errorResponse, handleApiError, parseJsonBody } from "@/lib/api-errors";

interface FeedbackCreateBody {
  type: FeedbackType;
  targetId: string;
  rating: number;
  comment?: string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateFeedbackBody(body: FeedbackCreateBody) {
  const validTypes = new Set<FeedbackType>(["Course", "Faculty"]);
  if (!validTypes.has(body.type)) {
    throw new ApiError("BAD_REQUEST", "type must be Course or Faculty", 400);
  }
  if (!isNonEmptyString(body.targetId)) {
    throw new ApiError("BAD_REQUEST", "targetId is required", 400);
  }
  if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
    throw new ApiError("BAD_REQUEST", "rating must be an integer between 1 and 5", 400);
  }
  if (body.comment !== undefined && typeof body.comment !== "string") {
    throw new ApiError("BAD_REQUEST", "comment must be a string", 400);
  }
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    // Load user with role and associated records
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        role: true,
        student: { select: { id: true } },
        faculty: { select: { id: true } },
      },
    });

    if (!user) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

    const { searchParams } = request.nextUrl;
    const targetId = searchParams.get("targetId");
    const type = searchParams.get("type") as FeedbackType | null;
    if (type && type !== "Course" && type !== "Faculty") {
      return errorResponse("BAD_REQUEST", "Invalid feedback type filter", 400);
    }

    // Build where clause with authorization checks
    const isAdmin = user.role === "ADMIN";
    const isFaculty = user.role === "FACULTY";

    // Admin and faculty can see feedback, students can only see their own
    let whereClause: Prisma.FeedbackWhereInput = {
      ...(targetId ? { targetId } : {}),
      ...(type ? { type } : {}),
    };

    if (!isAdmin && !isFaculty) {
      // Students can only see their own feedback
      if (!user.student) {
        return errorResponse("FORBIDDEN", "Forbidden", 403);
      }
      whereClause = { ...whereClause, studentId: user.student.id };
    }

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      select: {
        id: true,
        type: true,
        targetId: true,
        rating: true,
        comment: true,
        date: true,
        // studentId intentionally excluded from public response
      },
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    return handleApiError("GET /api/feedback", error);
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    const body = await parseJsonBody<FeedbackCreateBody>(request);
    validateFeedbackBody(body);

    // Resolve the student DB record from the authenticated Clerk user
    const student = await prisma.student.findFirst({
      where: { user: { clerkId: userId } },
      select: { id: true },
    });

    if (!student) {
      return errorResponse("FORBIDDEN", "Only students can submit feedback", 403);
    }

    // Duplicate prevention: check if already submitted for this target
    const existing = await prisma.feedback.findFirst({
      where: {
        studentId: student.id,
        targetId: body.targetId,
        type: body.type,
      },
    });

    if (existing) {
      return errorResponse(
        "BAD_REQUEST",
        "You have already submitted feedback for this target. You can only submit once per target.",
        400
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        studentId: student.id,
        type: body.type,
        targetId: body.targetId,
        rating: body.rating,
        comment: body.comment ?? "",
      },
      select: {
        id: true,
        type: true,
        targetId: true,
        rating: true,
        comment: true,
        date: true,
        // studentId not returned — anonymization
      },
    });

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    return handleApiError("POST /api/feedback", error);
  }
}