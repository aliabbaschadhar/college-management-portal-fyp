import prisma from "@/lib/prisma";

async function resolveDashboardUser(clerkId: string, email?: string | null) {
  const include = {
    student: true,
  } as const;

  const userByClerkId = await prisma.user.findUnique({
    where: { clerkId },
    include,
  });

  if (userByClerkId) {
    return userByClerkId;
  }

  if (!email) {
    return null;
  }

  const userByEmail = await prisma.user.findUnique({
    where: { email },
    include,
  });

  if (!userByEmail) {
    return null;
  }

  if (userByEmail.clerkId === clerkId) {
    return userByEmail;
  }

  return prisma.user.update({
    where: { id: userByEmail.id },
    data: { clerkId },
    include,
  });
}

export async function getStudentDashboardData(clerkId: string, email?: string | null) {
  const user = await resolveDashboardUser(clerkId, email);

  if (!user) {
    return null;
  }

  if (user.role?.toUpperCase() !== "STUDENT" || !user.student) {
    return { isNotStudent: true };
  }

  const student = user.student;

  // Fetch all other components in parallel to reduce sequential RTT delay
  const [
    grades,
    attendances,
    fees,
    initialEnrollments,
    quizAttempts,
    classTimetables,
    announcements,
  ] = await Promise.all([
    prisma.grade.findMany({
      where: {
        studentId: student.id,
        course: { semester: student.semester },
      },
      include: { course: true },
    }),
    prisma.attendance.findMany({
      where: {
        studentId: student.id,
        course: { semester: student.semester },
      },
      include: { course: true },
    }),
    prisma.fee.findMany({
      where: {
        studentId: student.id,
        semester: student.semester,
      },
    }),
    prisma.enrollment.findMany({
      where: {
        studentId: student.id,
        semester: student.semester,
      },
      include: {
        course: {
          include: {
            quizzes: true,
          },
        },
      },
    }),
    prisma.quizAttempt.findMany({
      where: { studentId: student.id },
    }),
    prisma.timetable.findMany({
      where: {
        course: {
          department: student.department,
          semester: student.semester,
        },
        shift: student.shift,
      },
      include: {
        course: {
          include: {
            faculty: {
              include: {
                user: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.announcement.findMany({
      where: {
        audience: { in: ["Students", "All"] },
      },
      orderBy: { date: "desc" },
      take: 5,
    }),
  ]);

  let enrollments = initialEnrollments;

  // Self-healing enrollments sync: run only if enrollments list is empty
  if (enrollments.length === 0) {
    const createdCount = await ensureStudentEnrollments(student.id, student.department, student.semester);
    if (createdCount > 0) {
      // Re-fetch only enrollments since they were newly created
      enrollments = await prisma.enrollment.findMany({
        where: { studentId: student.id, semester: student.semester },
        include: {
          course: {
            include: {
              quizzes: true,
            },
          },
        },
      });
    }
  }

  // STATS
  const avgGpa = grades.length > 0
    ? +(grades.reduce((sum, g) => sum + g.gpa, 0) / grades.length).toFixed(2)
    : null;

  const presentCount = attendances.filter((a) => a.status === "Present" || a.status === "Late").length;
  const attendancePercent = attendances.length > 0
    ? Math.round((presentCount / attendances.length) * 100)
    : null;

  const pendingDues = fees
    .filter((f) => f.status !== "Paid")
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPaid = fees
    .filter((f) => f.status === "Paid")
    .reduce((sum, f) => sum + f.amount, 0);

  const enrolledCourses = enrollments.map((e) => e.course);

  const stats = {
    currentGpa: avgGpa,
    currentGPA: avgGpa,
    attendanceRate: attendancePercent,
    attendancePercent,
    totalDues: pendingDues,
    pendingDues,
    totalCourses: enrolledCourses.length,
    enrolledCourses: enrolledCourses.length,
    totalPaid,
  };

  // Timetable: Map timetable format
  const timetable = classTimetables.map((t) => ({
    id: t.id,
    day: t.day,
    courseId: t.courseId,
    startTime: t.startTime,
    endTime: t.endTime,
    room: t.room,
    course: {
      courseCode: t.course.courseCode,
      courseName: t.course.courseName,
      department: t.course.department,
      semester: t.course.semester,
      faculty: t.course.faculty ? { user: { name: t.course.faculty.user.name } } : null,
    },
  }));

  // Quizzes
  const allQuizzes = enrolledCourses.flatMap((c) => c.quizzes);
  const attemptedQuizIds = quizAttempts.map((a) => a.quizId);
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
  const studentAnnouncements = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    content: a.content,
    priority: a.priority,
    date: a.date.toISOString(),
  }));

  // Chart Data: Attendance
  const attendanceChartData = enrolledCourses.map((course) => {
    const courseAttendances = attendances.filter((a) => a.courseId === course.id);
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
    const grade = grades.find((g) => g.courseId === course.id);
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
    studentProfile: {
      department: student.department,
      semester: student.semester,
      shift: student.shift,
    },
  };
}

export async function ensureStudentEnrollments(
  studentId: string,
  department: string,
  semester: number
): Promise<number> {
  // Check if student has any enrollments for this semester
  const count = await prisma.enrollment.count({
    where: { studentId, semester },
  });

  if (count > 0) {
    return 0;
  }

  // Find all courses matching department and semester
  const courses = await prisma.course.findMany({
    where: {
      department,
      semester,
    },
  });

  if (courses.length === 0) {
    return 0;
  }

  // Create enrollments for each course
  const enrollmentData = courses.map((course) => ({
    studentId,
    courseId: course.id,
    semester,
  }));

  const created = await prisma.enrollment.createMany({
    data: enrollmentData,
    skipDuplicates: true,
  });

  return created.count;
}
