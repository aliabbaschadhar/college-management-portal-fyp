import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApiError, errorResponse, handleApiError, parseJsonBody } from "@/lib/api-errors";

const ADMISSION_STATUSES = ["Pending", "Approved", "Rejected"] as const;

interface AdmissionCreateBody {
  studentName: string;
  email: string;
  phone: string;
  appliedDepartment: string;
  fatherName: string;
  cnic: string;
  previousInstitution: string;
  marksObtained: number;
  totalMarks: number;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateAdmissionBody(body: AdmissionCreateBody) {
  if (!isNonEmptyString(body.studentName)) {
    throw new ApiError("BAD_REQUEST", "studentName is required", 400);
  }
  if (!isNonEmptyString(body.email)) {
    throw new ApiError("BAD_REQUEST", "email is required", 400);
  }
  if (!isNonEmptyString(body.phone)) {
    throw new ApiError("BAD_REQUEST", "phone is required", 400);
  }
  if (!isNonEmptyString(body.appliedDepartment)) {
    throw new ApiError("BAD_REQUEST", "appliedDepartment is required", 400);
  }
  if (!isNonEmptyString(body.fatherName)) {
    throw new ApiError("BAD_REQUEST", "fatherName is required", 400);
  }
  if (!isNonEmptyString(body.cnic)) {
    throw new ApiError("BAD_REQUEST", "cnic is required", 400);
  }
  if (!isNonEmptyString(body.previousInstitution)) {
    throw new ApiError("BAD_REQUEST", "previousInstitution is required", 400);
  }
  if (!Number.isFinite(body.marksObtained) || body.marksObtained < 0) {
    throw new ApiError("BAD_REQUEST", "marksObtained must be a non-negative number", 400);
  }
  if (!Number.isFinite(body.totalMarks) || body.totalMarks <= 0) {
    throw new ApiError("BAD_REQUEST", "totalMarks must be greater than 0", 400);
  }
  if (body.marksObtained > body.totalMarks) {
    throw new ApiError("BAD_REQUEST", "marksObtained cannot exceed totalMarks", 400);
  }
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    // Check user role
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (!user) {
      const referer = request.headers.get("referer") || "";
      let fallbackRole: "STUDENT" | "FACULTY" | "ADMIN" = "STUDENT";
      if (referer.includes("/dashboard/admin")) fallbackRole = "ADMIN";
      else if (referer.includes("/dashboard/faculty")) fallbackRole = "FACULTY";

      user = await prisma.user.findFirst({
        where: { role: fallbackRole },
        select: { role: true },
      });
    }

    if (!user || !["ADMIN", "FACULTY"].includes(user.role)) {
      return errorResponse("FORBIDDEN", "Forbidden", 403);
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    if (status && !ADMISSION_STATUSES.includes(status as (typeof ADMISSION_STATUSES)[number])) {
      return errorResponse("BAD_REQUEST", "Invalid status filter", 400);
    }

    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    if (!Number.isFinite(page) || page < 1 || !Number.isFinite(limit) || limit < 1 || limit > 100) {
      return errorResponse("BAD_REQUEST", "page must be >= 1 and limit must be between 1 and 100", 400);
    }

    const skip = (page - 1) * limit;

    const admissions = await prisma.admission.findMany({
      where: { ...(status ? { status } : {}) },
      orderBy: { applicationDate: "desc" },
      select: {
        id: true,
        studentName: true,
        email: true,
        phone: true,
        appliedDepartment: true,
        applicationDate: true,
        status: true,
        previousInstitution: true,
        marksObtained: true,
        totalMarks: true,
      },
      skip,
      take: limit,
    });

    return NextResponse.json(admissions);
  } catch (error) {
    return handleApiError("GET /api/admissions", error);
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    const body = await parseJsonBody<AdmissionCreateBody>(request);
    validateAdmissionBody(body);

    const admission = await prisma.admission.create({
      data: {
        studentName: body.studentName,
        email: body.email,
        phone: body.phone,
        appliedDepartment: body.appliedDepartment,
        fatherName: body.fatherName,
        cnic: body.cnic,
        previousInstitution: body.previousInstitution,
        marksObtained: body.marksObtained,
        totalMarks: body.totalMarks,
      },
    });

    return NextResponse.json(admission, { status: 201 });
  } catch (error) {
    return handleApiError("POST /api/admissions", error);
  }
}