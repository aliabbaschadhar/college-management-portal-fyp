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
          id: true,
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
          id: true,
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

  // Compute current time for live timetable lookup
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
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: user.student.id },
      select: { courseId: true },
    });

    const courseIds = enrollments.map((e) => e.courseId);

    if (courseIds.length > 0) {
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
    const entry = await prisma.timetable.findFirst({
      where: {
        course: { assignedFaculty: user.faculty.id },
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

  // Assemble safe, display-ready profile data
  const profileData = {
    name: user.name ?? "Unknown",
    role: user.role as "STUDENT" | "FACULTY" | "ADMIN",
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
    ...(user.role === "ADMIN" ? { designation: "System Administrator" } : {}),
  };

  return (
    <main className="min-h-screen bg-brand-light flex flex-col items-center justify-center p-4 gap-6">
      <PublicProfileCard profile={profileData} />
    </main>
  );
}
