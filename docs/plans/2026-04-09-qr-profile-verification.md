# QR-Based Public Profile Verification — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow any person to scan a QR code (printed on student ID card, faculty badge, etc.) and view a public profile page in the browser — no login required.

**Architecture:** Each user gets a unique public profile URL (`/verify/[userId]`) that displays role-appropriate details. A new unprotected API route (`/api/verify/[userId]`) fetches safe-to-display data from Postgres. QR codes are generated client-side using the `qrcode.react` library and displayed inside each user's dashboard. The proxy middleware is updated to allow `/verify` routes without authentication.

**Tech Stack:** Next.js App Router (Server Component), Prisma ORM, `qrcode.react` (QR generation), Tailwind CSS v4, ShadCN UI, Framer Motion, Lucide React icons.

---

## Background & Context

### Existing Architecture
- **Auth:** Clerk handles all auth. Proxy at `src/proxy.ts` protects `/dashboard` routes.
- **DB:** PostgreSQL via Prisma (`src/lib/prisma.ts` singleton). Schemas in `prisma/schema.prisma`.
- **Users:** `User` → `Student` / `Faculty` / `Admin` with `role` enum. Students have `rollNo`, `department`, `semester`. Faculty have `department`, `specialization`.
- **Planned in architecture.md (line 81-83):** "`GET /verify/:registrationId` is planned backlog. Must only return safe data: Name, Roll No, Department, Dues Status, and Current Lecture."

### What Each Role's Public Profile Shows

| Data Field | Student | Faculty | Admin |
|---|---|---|---|
| Name | ✅ | ✅ | ✅ |
| Role Badge | ✅ | ✅ | ✅ |
| Department | ✅ | ✅ | — |
| Roll No | ✅ | — | — |
| Semester | ✅ | — | — |
| Enrollment Date | ✅ | — | — |
| Specialization | — | ✅ | — |
| Join Date | — | ✅ | — |
| Dues Status (Paid/Unpaid) | ✅ | — | — |
| Current Lecture (now) | ✅ | ✅ | — |
| Institution Name | ✅ | ✅ | ✅ |

> [!IMPORTANT]
> **No sensitive data exposed:** No email, phone, CNIC, grades, attendance percentages, or financial amounts are shown on the public page. Only verification-safe data.

---

## Task 1: Install `qrcode.react` Dependency

**Files:**
- Modify: `package.json`

**Step 1: Install the package**

Run:
```bash
bun install qrcode.react
```

Expected: Package added to `dependencies` in `package.json`.

**Step 2: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add qrcode.react for QR code generation"
```

---

## Task 2: Create the Public Verify API Route

This is an **unauthenticated** API route that returns safe profile data for any user by their `User.id`.

**Files:**
- Create: `src/app/api/verify/[userId]/route.ts`

**Step 1: Create the API route**

```typescript
// src/app/api/verify/[userId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ userId: string }>;
}

/**
 * Public (unauthenticated) endpoint that returns safe-to-display
 * profile data for QR-code-based identity verification.
 *
 * Returns: name, role, department, rollNo (student), specialization (faculty),
 *          dues status (student), current timetable entry, institution name.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { userId } = await context.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        student: {
          select: {
            rollNo: true,
            department: true,
            semester: true,
            enrollmentDate: true,
            fees: {
              where: { status: { in: ["Unpaid", "Overdue"] } },
              select: { id: true },
            },
          },
        },
        faculty: {
          select: {
            department: true,
            specialization: true,
            joinDate: true,
          },
        },
        admin: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Determine current lecture from timetable
    const now = new Date();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const currentDay = days[now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    let currentLecture: {
      courseName: string;
      courseCode: string;
      room: string;
      startTime: string;
      endTime: string;
    } | null = null;

    if (user.role === "STUDENT" && user.student) {
      // Find enrolled courses, then check timetable
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: user.student.rollNo ? undefined : undefined },
        select: { courseId: true },
      });

      // Get student record to find enrollments
      const studentRecord = await prisma.student.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });

      if (studentRecord) {
        const studentEnrollments = await prisma.enrollment.findMany({
          where: { studentId: studentRecord.id },
          select: { courseId: true },
        });

        const courseIds = studentEnrollments.map((e) => e.courseId);

        const timetableEntry = await prisma.timetable.findFirst({
          where: {
            courseId: { in: courseIds },
            day: currentDay,
            startTime: { lte: currentTime },
            endTime: { gte: currentTime },
          },
          include: {
            course: { select: { courseName: true, courseCode: true } },
          },
        });

        if (timetableEntry) {
          currentLecture = {
            courseName: timetableEntry.course.courseName,
            courseCode: timetableEntry.course.courseCode,
            room: timetableEntry.room,
            startTime: timetableEntry.startTime,
            endTime: timetableEntry.endTime,
          };
        }
      }
    }

    if (user.role === "FACULTY" && user.faculty) {
      // Find courses taught by this faculty
      const facultyRecord = await prisma.faculty.findFirst({
        where: { userId: user.id },
        select: { id: true },
      });

      if (facultyRecord) {
        const timetableEntry = await prisma.timetable.findFirst({
          where: {
            course: { assignedFaculty: facultyRecord.id },
            day: currentDay,
            startTime: { lte: currentTime },
            endTime: { gte: currentTime },
          },
          include: {
            course: { select: { courseName: true, courseCode: true } },
          },
        });

        if (timetableEntry) {
          currentLecture = {
            courseName: timetableEntry.course.courseName,
            courseCode: timetableEntry.course.courseCode,
            room: timetableEntry.room,
            startTime: timetableEntry.startTime,
            endTime: timetableEntry.endTime,
          };
        }
      }
    }

    // Build safe response
    const response: Record<string, unknown> = {
      name: user.name,
      role: user.role,
      institution: "Govt. Graduate College, Hafizabad",
      currentLecture,
    };

    if (user.role === "STUDENT" && user.student) {
      response.rollNo = user.student.rollNo;
      response.department = user.student.department;
      response.semester = user.student.semester;
      response.enrollmentDate = user.student.enrollmentDate.toISOString();
      response.duesStatus =
        user.student.fees.length > 0 ? "Outstanding" : "Clear";
    }

    if (user.role === "FACULTY" && user.faculty) {
      response.department = user.faculty.department;
      response.specialization = user.faculty.specialization;
      response.joinDate = user.faculty.joinDate.toISOString();
    }

    if (user.role === "ADMIN") {
      response.designation = "System Administrator";
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/verify/[userId] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
```

**Step 2: Verify the API builds**

Run:
```bash
bunx tsc --noEmit
```

Expected: No type errors.

**Step 3: Commit**

```bash
git add src/app/api/verify/
git commit -m "feat: add public verify API route for QR profile lookup"
```

---

## Task 3: Update Proxy to Allow `/verify` Routes Without Auth

The proxy currently lets anything outside `/dashboard` pass through, so `/verify` pages will naturally be unprotected. However, we should be **explicit** — add `/verify` to the auth-route exclusion list for clarity and future-proofing.

**Files:**
- Modify: `src/proxy.ts:4`

**Step 1: Add `/verify` to the auth route matcher**

In `src/proxy.ts`, update line 4:

```typescript
// BEFORE:
const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/webhooks(.*)'])

// AFTER:
const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/webhooks(.*)', '/verify(.*)', '/api/verify(.*)'])
```

**Step 2: Verify the proxy builds**

Run:
```bash
bunx tsc --noEmit
```

Expected: No type errors.

**Step 3: Commit**

```bash
git add src/proxy.ts
git commit -m "feat: allow /verify and /api/verify routes to bypass auth"
```

---

## Task 4: Create the Public Profile Page (Server Component)

This is the page users see when they scan the QR code. It fetches data from the verify API and renders a beautiful, branded profile card — no login required.

**Files:**
- Create: `src/app/verify/[userId]/page.tsx`
- Create: `src/app/verify/layout.tsx`

**Step 1: Create the verify layout (no dashboard shell, no auth)**

```typescript
// src/app/verify/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Profile — College Management Portal",
  description:
    "Public profile verification page for students, faculty, and administrators.",
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

**Step 2: Create the public profile page**

```tsx
// src/app/verify/[userId]/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PublicProfileCard } from "./PublicProfileCard";

interface VerifyPageProps {
  params: Promise<{ userId: string }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      student: {
        select: {
          rollNo: true,
          department: true,
          semester: true,
          enrollmentDate: true,
          fees: {
            where: { status: { in: ["Unpaid", "Overdue"] } },
            select: { id: true },
          },
        },
      },
      faculty: {
        select: {
          department: true,
          specialization: true,
          joinDate: true,
        },
      },
      admin: {
        select: { id: true },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Get current lecture
  const now = new Date();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDay = days[now.getDay()];
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  let currentLecture: {
    courseName: string;
    courseCode: string;
    room: string;
    startTime: string;
    endTime: string;
  } | null = null;

  if (user.role === "STUDENT" && user.student) {
    const studentRecord = await prisma.student.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    if (studentRecord) {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: studentRecord.id },
        select: { courseId: true },
      });

      const courseIds = enrollments.map((e) => e.courseId);

      const entry = await prisma.timetable.findFirst({
        where: {
          courseId: { in: courseIds },
          day: currentDay,
          startTime: { lte: currentTime },
          endTime: { gte: currentTime },
        },
        include: {
          course: { select: { courseName: true, courseCode: true } },
        },
      });

      if (entry) {
        currentLecture = {
          courseName: entry.course.courseName,
          courseCode: entry.course.courseCode,
          room: entry.room,
          startTime: entry.startTime,
          endTime: entry.endTime,
        };
      }
    }
  }

  if (user.role === "FACULTY" && user.faculty) {
    const facultyRecord = await prisma.faculty.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });

    if (facultyRecord) {
      const entry = await prisma.timetable.findFirst({
        where: {
          course: { assignedFaculty: facultyRecord.id },
          day: currentDay,
          startTime: { lte: currentTime },
          endTime: { gte: currentTime },
        },
        include: {
          course: { select: { courseName: true, courseCode: true } },
        },
      });

      if (entry) {
        currentLecture = {
          courseName: entry.course.courseName,
          courseCode: entry.course.courseCode,
          room: entry.room,
          startTime: entry.startTime,
          endTime: entry.endTime,
        };
      }
    }
  }

  // Build profile data
  const profileData = {
    name: user.name ?? "Unknown",
    role: user.role,
    institution: "Govt. Graduate College, Hafizabad",
    currentLecture,
    ...(user.role === "STUDENT" && user.student
      ? {
          rollNo: user.student.rollNo,
          department: user.student.department,
          semester: user.student.semester,
          enrollmentDate: user.student.enrollmentDate.toISOString(),
          duesStatus:
            user.student.fees.length > 0
              ? ("Outstanding" as const)
              : ("Clear" as const),
        }
      : {}),
    ...(user.role === "FACULTY" && user.faculty
      ? {
          department: user.faculty.department,
          specialization: user.faculty.specialization,
          joinDate: user.faculty.joinDate.toISOString(),
        }
      : {}),
    ...(user.role === "ADMIN"
      ? { designation: "System Administrator" }
      : {}),
  };

  return (
    <main className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <PublicProfileCard profile={profileData} />
    </main>
  );
}
```

**Step 3: Commit**

```bash
git add src/app/verify/
git commit -m "feat: add public verify page with server-side data fetching"
```

---

## Task 5: Create the PublicProfileCard Client Component

This is the animated, premium-looking profile card that renders on the verify page. It uses Framer Motion, Lucide icons, and Tailwind — matching the project's dark glassmorphism aesthetic.

**Files:**
- Create: `src/app/verify/[userId]/PublicProfileCard.tsx`

**Step 1: Create the component**

```tsx
// src/app/verify/[userId]/PublicProfileCard.tsx
"use client";

import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  BookOpen,
  Building2,
  Calendar,
  Clock,
  MapPin,
  BadgeCheck,
  AlertCircle,
  Shield,
  Briefcase,
} from "lucide-react";

interface CurrentLecture {
  courseName: string;
  courseCode: string;
  room: string;
  startTime: string;
  endTime: string;
}

interface ProfileData {
  name: string;
  role: "STUDENT" | "FACULTY" | "ADMIN";
  institution: string;
  currentLecture: CurrentLecture | null;
  rollNo?: string;
  department?: string;
  semester?: number;
  enrollmentDate?: string;
  duesStatus?: "Outstanding" | "Clear";
  specialization?: string;
  joinDate?: string;
  designation?: string;
}

const roleConfig = {
  STUDENT: {
    label: "Student",
    icon: GraduationCap,
    gradient: "from-brand-primary to-brand-secondary",
    badgeColor: "bg-brand-primary/10 text-brand-primary",
  },
  FACULTY: {
    label: "Faculty",
    icon: Briefcase,
    gradient: "from-[#A78BFA] to-brand-primary",
    badgeColor: "bg-[#A78BFA]/10 text-[#A78BFA]",
  },
  ADMIN: {
    label: "Administrator",
    icon: Shield,
    gradient: "from-system-danger to-[#F59E0B]",
    badgeColor: "bg-system-danger/10 text-system-danger",
  },
};

export function PublicProfileCard({ profile }: { profile: ProfileData }) {
  const config = roleConfig[profile.role];
  const RoleIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      {/* Card */}
      <div className="bg-brand-white rounded-2xl shadow-xl overflow-hidden border border-brand-light">
        {/* Header gradient */}
        <div
          className={`bg-gradient-to-r ${config.gradient} px-6 py-8 text-center relative`}
        >
          {/* Verified badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="absolute top-4 right-4"
          >
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white font-medium">
              <BadgeCheck className="w-3.5 h-3.5" />
              Verified
            </div>
          </motion.div>

          {/* Avatar circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center mb-4"
          >
            <User className="w-10 h-10 text-white" />
          </motion.div>

          {/* Name */}
          <h1 className="text-2xl font-bold text-white mb-1">
            {profile.name}
          </h1>

          {/* Role badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm text-white font-medium">
            <RoleIcon className="w-4 h-4" />
            {config.label}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          {/* Institution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 text-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
              <Building2 className="w-4.5 h-4.5 text-brand-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Institution</p>
              <p className="font-medium text-brand-dark">
                {profile.institution}
              </p>
            </div>
          </motion.div>

          {/* Role-specific fields */}
          {profile.role === "STUDENT" && (
            <>
              <ProfileRow
                icon={BookOpen}
                label="Roll Number"
                value={profile.rollNo ?? "—"}
                delay={0.45}
              />
              <ProfileRow
                icon={GraduationCap}
                label="Department"
                value={profile.department ?? "—"}
                delay={0.5}
              />
              <ProfileRow
                icon={Calendar}
                label="Semester"
                value={`Semester ${profile.semester}`}
                delay={0.55}
              />
              <ProfileRow
                icon={Calendar}
                label="Enrolled Since"
                value={
                  profile.enrollmentDate
                    ? new Date(profile.enrollmentDate).toLocaleDateString(
                        "en-PK",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "—"
                }
                delay={0.6}
              />

              {/* Dues status with color coding */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 }}
                className="flex items-center gap-3 text-sm"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
                  {profile.duesStatus === "Clear" ? (
                    <BadgeCheck className="w-4.5 h-4.5 text-system-success" />
                  ) : (
                    <AlertCircle className="w-4.5 h-4.5 text-system-danger" />
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Dues Status</p>
                  <p
                    className={`font-semibold ${
                      profile.duesStatus === "Clear"
                        ? "text-system-success"
                        : "text-system-danger"
                    }`}
                  >
                    {profile.duesStatus === "Clear"
                      ? "✓ All Dues Clear"
                      : "⚠ Dues Outstanding"}
                  </p>
                </div>
              </motion.div>
            </>
          )}

          {profile.role === "FACULTY" && (
            <>
              <ProfileRow
                icon={GraduationCap}
                label="Department"
                value={profile.department ?? "—"}
                delay={0.45}
              />
              <ProfileRow
                icon={Briefcase}
                label="Specialization"
                value={profile.specialization ?? "—"}
                delay={0.5}
              />
              <ProfileRow
                icon={Calendar}
                label="Joined"
                value={
                  profile.joinDate
                    ? new Date(profile.joinDate).toLocaleDateString("en-PK", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"
                }
                delay={0.55}
              />
            </>
          )}

          {profile.role === "ADMIN" && (
            <ProfileRow
              icon={Shield}
              label="Designation"
              value={profile.designation ?? "System Administrator"}
              delay={0.45}
            />
          )}

          {/* Current Lecture (if any) */}
          {profile.currentLecture && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-4 p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10"
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
                  Currently In Class
                </span>
              </div>
              <p className="font-semibold text-brand-dark">
                {profile.currentLecture.courseName}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile.currentLecture.courseCode}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.currentLecture.room}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {profile.currentLecture.startTime} –{" "}
                  {profile.currentLecture.endTime}
                </span>
              </div>
            </motion.div>
          )}

          {!profile.currentLecture && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-4 p-4 bg-muted/50 rounded-xl border border-border"
            >
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="w-4 h-4" />
                <span>No active class right now</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-brand-light/50 border-t border-brand-light text-center">
          <p className="text-xs text-muted-foreground">
            Verified by College Management Portal
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-1">
            Scanned at{" "}
            {new Date().toLocaleString("en-PK", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Reusable row component
function ProfileRow({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 text-sm"
    >
      <div className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-brand-primary" />
      </div>
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-medium text-brand-dark">{value}</p>
      </div>
    </motion.div>
  );
}
```

**Step 2: Verify it compiles**

Run:
```bash
bunx tsc --noEmit
```

Expected: No type errors.

**Step 3: Commit**

```bash
git add src/app/verify/
git commit -m "feat: add animated PublicProfileCard component for QR verification"
```

---

## Task 6: Create the QR Code Component for Dashboard

This is a reusable client component that generates and displays a QR code pointing to the user's public profile URL.

**Files:**
- Create: `src/components/dashboard/ProfileQRCode.tsx`

**Step 1: Create the QR code component**

```tsx
// src/components/dashboard/ProfileQRCode.tsx
"use client";

import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { QrCode, Download, ExternalLink } from "lucide-react";
import { useRef, useCallback } from "react";

interface ProfileQRCodeProps {
  userId: string;
  userName: string;
}

export function ProfileQRCode({ userId, userName }: ProfileQRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/${userId}`
      : `/verify/${userId}`;

  const handleDownload = useCallback(() => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx?.scale(2, 2);
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `${userName.replace(/\s+/g, "_")}_QR.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = url;
  }, [userName]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="w-5 h-5 text-brand-primary" />
        <h3 className="font-semibold text-foreground">Your QR Code</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Anyone can scan this code to verify your identity — no login required.
      </p>

      {/* QR Code */}
      <div
        ref={qrRef}
        className="flex justify-center p-4 bg-white rounded-lg border border-brand-light"
      >
        <QRCodeSVG
          value={profileUrl}
          size={180}
          bgColor="#FFFFFF"
          fgColor="#131022"
          level="H"
          includeMargin
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Preview
        </a>
      </div>
    </motion.div>
  );
}
```

**Step 2: Verify it compiles**

Run:
```bash
bunx tsc --noEmit
```

Expected: No type errors.

**Step 3: Commit**

```bash
git add src/components/dashboard/ProfileQRCode.tsx
git commit -m "feat: add ProfileQRCode component with download functionality"
```

---

## Task 7: Integrate QR Code into the Dashboard Settings Page

Add the `ProfileQRCode` component to the settings page so every logged-in user can see and download their personal QR code.

**Files:**
- Modify: `src/app/dashboard/settings/page.tsx` (exact changes depend on current structure)

**Step 1: Explore the current settings page**

Run:
```bash
cat src/app/dashboard/settings/page.tsx
```

Read the file to understand its current structure. Then add the `ProfileQRCode` component.

**Step 2: Add the QR code section**

The settings page needs to:
1. Be a Server Component (or have a Server Component wrapper) that fetches the current user's `userId` from Prisma via their Clerk ID.
2. Pass `userId` and `userName` to the `ProfileQRCode` client component.

Add at the top of the settings page, inside the main content area:

```tsx
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { ProfileQRCode } from "@/components/dashboard/ProfileQRCode";

// Inside the Server Component:
const clerkUser = await currentUser();
const dbUser = await prisma.user.findUnique({
  where: { clerkId: clerkUser!.id },
  select: { id: true, name: true },
});

// Then render it in the JSX:
{dbUser && (
  <ProfileQRCode
    userId={dbUser.id}
    userName={dbUser.name ?? "User"}
  />
)}
```

**Step 3: Verify the page builds**

Run:
```bash
bunx tsc --noEmit
```

Expected: No type errors.

**Step 4: Commit**

```bash
git add src/app/dashboard/settings/
git commit -m "feat: integrate ProfileQRCode into dashboard settings page"
```

---

## Task 8: Add a 404 Page for Invalid Verify URLs

**Files:**
- Create: `src/app/verify/[userId]/not-found.tsx`

**Step 1: Create the not-found page**

```tsx
// src/app/verify/[userId]/not-found.tsx
import Link from "next/link";
import { UserX } from "lucide-react";

export default function VerifyNotFound() {
  return (
    <main className="min-h-screen bg-brand-light flex items-center justify-center p-4">
      <div className="bg-brand-white rounded-2xl shadow-xl p-8 max-w-sm text-center border border-brand-light">
        <div className="w-16 h-16 rounded-full bg-system-danger/10 mx-auto flex items-center justify-center mb-4">
          <UserX className="w-8 h-8 text-system-danger" />
        </div>
        <h1 className="text-xl font-bold text-brand-dark mb-2">
          Profile Not Found
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          The QR code you scanned does not match any registered user in the
          College Management Portal.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-5 py-2.5 bg-brand-primary text-brand-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Go to Homepage
        </Link>
      </div>
    </main>
  );
}
```

**Step 2: Commit**

```bash
git add src/app/verify/
git commit -m "feat: add 404 page for invalid QR verification URLs"
```

---

## Task 9: Update Architecture Docs

Update the architecture document to reflect that QR verification is now implemented.

**Files:**
- Modify: `src/../.agent/architecture.md:81-83`

**Step 1: Update the QR section**

Change lines 81-83 from:
```markdown
### QR Verification (Public Route)
* `GET /verify/:registrationId` is planned backlog and not yet implemented.
* When implemented, it must only return safe data: Name, Roll No, Department, Dues Status, and Current Lecture.
```

To:
```markdown
### QR Verification (Public Route) — Implemented
* `GET /verify/[userId]` — Public page (Server Component) and API (`/api/verify/[userId]`) that returns safe profile data.
* Each user can view/download their personal QR code from Dashboard → Settings.
* Safe data exposed: Name, Role, Department, Roll No (student), Specialization (faculty), Dues Status (student), Current Lecture, Institution Name.
* No email, phone, CNIC, grades, or financial amounts are exposed.
```

**Step 2: Update prd.md FR-09**

Change `FR-09` status from `Planned / Backlog` to `Implemented`:
```markdown
| **FR-09 — Student QR Verification** | QR code scanned reveals basic public profile without login. | **Implemented** |
```

**Step 3: Commit**

```bash
git add .agent/architecture.md .agent/prd.md
git commit -m "docs: mark QR verification as implemented in architecture and PRD"
```

---

## Task 10: Manual Verification & Build Check

**Step 1: Run the full type check**

```bash
bunx tsc --noEmit
```

Expected: Zero errors.

**Step 2: Run the linter**

```bash
bunx next lint
```

Expected: No blocking errors.

**Step 3: Run a production build**

```bash
bun run build
```

Expected: Build succeeds, `/verify/[userId]` listed as a dynamic route.

**Step 4: Manual browser test**

1. Start the dev server: `bun run dev`
2. Navigate to `http://localhost:3000/dashboard/settings` — verify the QR code is visible.
3. Click "Preview" on the QR code — verify the public profile page loads.
4. Copy the `/verify/[userId]` URL and open it in an incognito window (no login) — verify it loads successfully with correct data.
5. Test with an invalid user ID (`/verify/invalid-uuid`) — verify the 404 page appears.

**Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete QR-based public profile verification (FR-09)"
```

---

## Summary of Files Created/Modified

| Action | File |
|---|---|
| **CREATE** | `src/app/api/verify/[userId]/route.ts` |
| **CREATE** | `src/app/verify/layout.tsx` |
| **CREATE** | `src/app/verify/[userId]/page.tsx` |
| **CREATE** | `src/app/verify/[userId]/PublicProfileCard.tsx` |
| **CREATE** | `src/app/verify/[userId]/not-found.tsx` |
| **CREATE** | `src/components/dashboard/ProfileQRCode.tsx` |
| **MODIFY** | `src/proxy.ts` |
| **MODIFY** | `src/app/dashboard/settings/page.tsx` |
| **MODIFY** | `.agent/architecture.md` |
| **MODIFY** | `.agent/prd.md` |
