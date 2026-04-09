import prisma from "@/lib/prisma";

export async function getStudentDashboardData(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: {
      student: {
        include: {
          enrollments: {
            include: {
              course: {
                include: {
                  timetables: true,
                  quizzes: true,
                },
              },
            },
          },
          attendances: { include: { course: true } },
          fees: true,
          grades: { include: { course: true } },
          quizAttempts: true,
        },
      },
    },
  });

  if (!user || user.role?.toUpperCase() !== "STUDENT" || !user.student) {
    return null;
  }

  const student = user.student;

  // STATS
  const grades = student.grades;
  const avgGpa = grades.length > 0
    ? +(grades.reduce((sum, g) => sum + g.gpa, 0) / grades.length).toFixed(2)
    : 0;

  const presentCount = student.attendances.filter((a) => a.status === "Present" || a.status === "Late").length;
  const attendancePercent = student.attendances.length > 0
    ? Math.round((presentCount / student.attendances.length) * 100)
    : 100;

  const pendingDues = student.fees
    .filter((f) => f.status !== "Paid")
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPaid = student.fees
    .filter((f) => f.status === "Paid")
    .reduce((sum, f) => sum + f.amount, 0);

  const enrolledCourses = student.enrollments.map((e) => e.course);

  const stats = {
    currentGPA: avgGpa,
    attendancePercent,
    pendingDues,
    enrolledCourses: enrolledCourses.length,
    totalPaid,
  };

  // Timetable
  const timetable = enrolledCourses.flatMap((c) => 
    c.timetables.map((t) => ({
      id: t.id,
      day: t.day,
      courseCode: c.courseCode,
      courseName: c.courseName,
      startTime: t.startTime,
      endTime: t.endTime,
      room: t.room,
    }))
  );

  // Quizzes
  const allQuizzes = enrolledCourses.flatMap((c) => c.quizzes);
  const attemptedQuizIds = student.quizAttempts.map((a) => a.quizId);
  const pendingQuizzes = allQuizzes
    .filter((q) => q.status === "Published" && !attemptedQuizIds.includes(q.id))
    .map((q) => ({
      id: q.id,
      title: q.title,
      courseId: q.courseId,
      duration: q.duration,
      dueDate: q.dueDate.toISOString(),
      status: q.status,
    }));

  // Announcements
  const announcements = await prisma.announcement.findMany({
    where: {
      audience: { in: ["Students", "All"] },
    },
    orderBy: { date: "desc" },
    take: 5,
  });

  const studentAnnouncements = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    priority: a.priority,
    date: a.date.toISOString(),
  }));

  // Chart Data: Attendance
  const attendanceChartData = enrolledCourses.map((course) => {
    const courseAttendances = student.attendances.filter((a) => a.courseId === course.id);
    const present = courseAttendances.filter((a) => a.status === "Present").length;
    const absent = courseAttendances.filter((a) => a.status === "Absent").length;
    const late = courseAttendances.filter((a) => a.status === "Late").length;

    return {
      course: course.courseCode,
      present,
      absent,
      late,
    };
  });

  // Chart Data: Grades
  const gradeChartData = enrolledCourses.map((course) => {
    const grade = student.grades.find((g) => g.courseId === course.id);
    return {
      course: course.courseCode,
      quiz: grade?.quizMarks || 0,
      assignment: grade?.assignmentMarks || 0,
      mid: grade?.midMarks || 0,
      final: grade?.finalMarks || 0,
    };
  });

  return {
    stats,
    courses: enrolledCourses.map((c) => ({
      id: c.id,
      courseCode: c.courseCode,
      courseName: c.courseName,
      creditHours: c.creditHours,
    })),
    timetable,
    pendingQuizzes,
    studentAnnouncements,
    attendanceChartData,
    gradeChartData,
  };
}
