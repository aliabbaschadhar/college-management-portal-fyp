import prisma from "@/lib/prisma";

interface FacultyDashboardData {
  stats: {
    totalCourses: number;
    totalStudents: number;
    avgRating: number;
    pendingQuizReviews: number;
  };
  courses: { id: string; courseCode: string; courseName: string; enrolledCount: number }[];
  timetable: {
    id: string;
    day: string;
    courseCode: string;
    courseName: string;
    startTime: string;
    endTime: string;
    room: string;
  }[];
  announcements: { id: string; title: string; priority: string; date: string }[];
}

export async function getFacultyDashboardData(
  clerkId: string
): Promise<FacultyDashboardData | null> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      faculty: {
        include: {
          teaches: {
            include: {
              enrollments: { select: { studentId: true } },
              timetables: true,
              quizzes: { where: { status: "Published" } },
            },
          },
        },
      },
    },
  });

  if (!user || user.role !== "FACULTY" || !user.faculty) {
    return null;
  }

  const faculty = user.faculty;
  const courses = faculty.teaches;

  const uniqueStudentIds = new Set<string>();
  for (const course of courses) {
    for (const enrollment of course.enrollments) {
      uniqueStudentIds.add(enrollment.studentId);
    }
  }

  const feedbacks = await prisma.feedback.findMany({
    where: { targetId: faculty.id, type: "Faculty" },
    select: { rating: true },
  });

  const avgRating =
    feedbacks.length > 0
      ? +(feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(2)
      : 0;

  const pendingQuizReviews = courses.reduce((sum, c) => sum + c.quizzes.length, 0);

  const announcements = await prisma.announcement.findMany({
    where: { audience: { in: ["Faculty", "All"] } },
    orderBy: { date: "desc" },
    take: 5,
    select: { id: true, title: true, priority: true, date: true },
  });

  return {
    stats: {
      totalCourses: courses.length,
      totalStudents: uniqueStudentIds.size,
      avgRating,
      pendingQuizReviews,
    },
    courses: courses.map((c) => ({
      id: c.id,
      courseCode: c.courseCode,
      courseName: c.courseName,
      enrolledCount: c.enrollments.length,
    })),
    timetable: courses.flatMap((c) =>
      c.timetables.map((t) => ({
        id: t.id,
        day: t.day,
        courseCode: c.courseCode,
        courseName: c.courseName,
        startTime: t.startTime,
        endTime: t.endTime,
        room: t.room,
      }))
    ),
    announcements: announcements.map((a) => ({
      id: a.id,
      title: a.title,
      priority: a.priority,
      date: a.date.toISOString(),
    })),
  };
}
