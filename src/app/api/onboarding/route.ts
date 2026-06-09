import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { errorResponse, handleApiError } from "@/lib/api-errors";
import { Role } from "@prisma/client";
import { requireRole } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  const denied = await requireRole(["ADMIN"]);
  if (denied) return denied;

  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");

    const requests = await prisma.onboardingRequest.findMany({
      where: {
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    return handleApiError("GET /api/onboarding", error);
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    const body = (await request.json()) as {
      role: Role;
      phone?: string;
      department?: string;
      specialization?: string;
      adminSecret?: string;
    };

    const { role, phone, department, specialization, adminSecret } = body;

    if (!role || !["FACULTY", "ADMIN"].includes(role)) {
      return errorResponse("BAD_REQUEST", "Invalid role selected", 400);
    }

    if (!phone || !phone.trim()) {
      return errorResponse("BAD_REQUEST", "Phone number is required", 400);
    }

    if (role === "FACULTY") {
      if (!department || !department.trim()) {
        return errorResponse("BAD_REQUEST", "Department is required for Faculty", 400);
      }
      if (!specialization || !specialization.trim()) {
        return errorResponse("BAD_REQUEST", "Specialization is required for Faculty", 400);
      }
    }

    if (role === "ADMIN") {
      if (!specialization || !specialization.trim()) {
        return errorResponse("BAD_REQUEST", "Designation is required for Admin", 400);
      }

      // If it is the first admin (0 admins in the DB), bypass secret key validation
      const adminsCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });
      const isFirstAdmin = adminsCount === 0;

      if (!isFirstAdmin) {
        // Check admin secret key
        const dbSettings = await prisma.systemSettings.findUnique({
          where: { key: "admin_onboarding_secret" },
        });
        const expectedSecret = dbSettings?.value || "GGC-ADMIN-SECRET-2026";

        if (!adminSecret || adminSecret.trim() !== expectedSecret.trim()) {
          return errorResponse("FORBIDDEN", "Invalid Admin Verification Secret Key. Please obtain the correct key from the head administrator.", 403);
        }
      }
    }

    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;
    if (!email) {
      return errorResponse("BAD_REQUEST", "No email address found in Clerk", 400);
    }

    const name = clerkUser ? [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") : "New User";

    // Check if user already has a profile in DB
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkId: userId },
          { email }
        ]
      },
      include: { student: true, faculty: true, admin: true },
    });

    if (existingUser) {
      if (existingUser.student || existingUser.faculty || existingUser.admin) {
        return errorResponse("BAD_REQUEST", "Account already onboarded and profile exists", 400);
      }
    }

    // Check if a request already exists and is pending
    const existingRequest = await prisma.onboardingRequest.findUnique({
      where: { email },
    });

    if (existingRequest && existingRequest.status === "Pending") {
      return errorResponse("BAD_REQUEST", "You already have a pending request under review", 400);
    }

    // Check if we need to auto-approve the first admin (fresh db setup, 0 existing admins)
    let isAutoApproveAdmin = false;
    if (role === "ADMIN") {
      const adminsCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });
      if (adminsCount === 0) {
        isAutoApproveAdmin = true;
      }
    }

    // Update or create the base User and provision the Admin profile immediately if auto-approved
    if (existingUser) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role,
          clerkId: userId, // Ensure clerkId is synchronized
          ...(isAutoApproveAdmin ? {
            admin: {
              create: {},
            },
          } : {}),
        },
      });
    } else {
      await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name,
          role,
          ...(isAutoApproveAdmin ? {
            admin: {
              create: {},
            },
          } : {}),
        },
      });
    }

    // Create or update the onboarding request record
    const onboardingRequest = await prisma.onboardingRequest.upsert({
      where: { email },
      update: {
        name,
        role,
        phone,
        department: role === "FACULTY" ? department : null,
        specialization: role === "FACULTY" || role === "ADMIN" ? specialization : null,
        status: isAutoApproveAdmin ? "Approved" : "Pending",
      },
      create: {
        email,
        name,
        role,
        phone,
        department: role === "FACULTY" ? department : null,
        specialization: role === "FACULTY" || role === "ADMIN" ? specialization : null,
        status: isAutoApproveAdmin ? "Approved" : "Pending",
      },
    });

    // If auto-approved, sync role immediately to Clerk metadata
    if (isAutoApproveAdmin) {
      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
          publicMetadata: { role: "admin" },
        });
      } catch (clerkErr) {
        console.error("Clerk role sync failed during auto-admin approval:", clerkErr);
      }
    }

    return NextResponse.json(onboardingRequest, { status: 201 });
  } catch (error) {
    return handleApiError("POST /api/onboarding", error);
  }
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "Unauthorized", 401);

  try {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress;

    if (!email) {
      return errorResponse("BAD_REQUEST", "No email address found in Clerk", 400);
    }

    // Delete the request
    await prisma.onboardingRequest.deleteMany({
      where: { email },
    });

    // Reset User's role back to STUDENT (default onboarding status)
    await prisma.user.updateMany({
      where: { clerkId: userId },
      data: { role: "STUDENT" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError("DELETE /api/onboarding", error);
  }
}
