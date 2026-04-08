import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");

    const admissions = await prisma.admission.findMany({
      where: { ...(status ? { status } : {}) },
      orderBy: { applicationDate: "desc" },
    });

    return NextResponse.json(admissions);
  } catch (error) {
    console.error("GET /api/admissions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as {
      studentName: string;
      email: string;
      phone: string;
      appliedDepartment: string;
      fatherName: string;
      cnic: string;
      previousInstitution: string;
      marksObtained: number;
      totalMarks: number;
    };

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
    console.error("POST /api/admissions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
