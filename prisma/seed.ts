import { PrismaClient } from "@prisma/client";
import {
  mockStudents,
  mockFaculty,
  mockCourses,
  mockAdmissions,
  mockFees,
  mockAnnouncements,
  mockFeedback,
  mockTimetable,
  mockQuizzes,
  mockQuestions,
  mockQuizAttempts,
  mockGrades,
  mockEnrollments,
  mockTeaches,
  mockAttendance,
} from "../src/lib/mock-data";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Clerk ID → mock-profile-id lookup maps ─────────────────
  const STUDENT_CLERK_IDS: Record<string, string> = {
    s1: "user_3C9cPnJBgQQum6oC9Bd6iaYdIYM",  // Ali Abbas
    s2: "user_3C9TUj65lyHr9jwkUStkuyRgIut",  // Fatima Zahra
    s3: "user_3C9gAqqP8REEpeVX86W0ELzinur",  // Muhammad Usman
  };

  const FACULTY_CLERK_IDS: Record<string, string> = {
    f1: "user_3C9cVNeByLUAptMRkUMgw8gyzdW",  // Dr. Khalid Mahmood
    f2: "user_3C9fgZSJgjXCzhyP47JUOwQf0jj",  // Dr. Amina Rashid
    f3: "user_3C9g1tP7H7v03w2CJIrq6g47ymX",  // Prof. Zahid Iqbal
  };

  const ADMIN_ACCOUNTS = [
    { clerkId: "user_3C9cf7vvuywZKrZicAweaHGtiNr", email: "admin@college.edu.pk",  name: "Admin Tester" },
    { clerkId: "user_3C9g1Lp0h1opFyWAbBn0pccGQhs", email: "admin2@college.edu.pk", name: "Dr. Zafar Iqbal" },
    { clerkId: "user_3C9fiFD4wdqiUTFGwYyQAbvc7N6", email: "admin3@college.edu.pk", name: "Prof. Nadia Sheikh" },
  ];

  console.log("Seeding database...");

  // Create Admins
  for (const admin of ADMIN_ACCOUNTS) {
    await prisma.user.create({
      data: {
        clerkId: admin.clerkId,
        email: admin.email,
        name: admin.name,
        role: "ADMIN",
        admin: { create: {} },
      },
    });
  }
  console.log("Admins seeded.");

  // Iterate students
  for (const s of mockStudents) {
    const clerkId = STUDENT_CLERK_IDS[s.id] ?? "mock_clerk_" + s.id;
    await prisma.user.create({
      data: {
        clerkId,
        email: s.email,
        name: s.name,
        role: "STUDENT",
        student: {
          create: {
            id: s.id, // specify same id
            rollNo: s.rollNo,
            phone: s.phone,
            department: s.department,
            semester: s.semester,
            enrollmentDate: new Date(s.enrollmentDate),
            avatar: undefined
          }
        }
      }
    });
  }

  // Iterate faculty
  for (const f of mockFaculty) {
    const clerkId = FACULTY_CLERK_IDS[f.id] ?? "mock_clerk_" + f.id;
    await prisma.user.create({
      data: {
        clerkId,
        email: f.email,
        name: f.name,
        role: "FACULTY",
        faculty: {
          create: {
            id: f.id,
            phone: f.phone,
            department: f.department,
            specialization: f.specialization,
            joinDate: new Date(f.joinDate),
            avatar: undefined
          }
        }
      }
    });
  }
  console.log("Users seeded.");

  // Courses
  for (const c of mockCourses) {
    // Find faculty mapping (must wait for creation above)
    const facultyAssign = mockTeaches.find(t => t.courseId === c.id);
    await prisma.course.create({
      data: {
        id: c.id,
        courseCode: c.courseCode,
        courseName: c.courseName,
        creditHours: c.creditHours,
        department: c.department,
        semester: c.semester,
        assignedFaculty: facultyAssign ? facultyAssign.facultyId : null
      }
    });
  }
  console.log("Courses seeded.");

  // Enrollments
  for (const e of mockEnrollments) {
    const course = mockCourses.find(c => c.id === e.courseId);
    await prisma.enrollment.create({
      data: {
        studentId: e.studentId,
        courseId: e.courseId,
        semester: course?.semester || 1
      }
    });
  }
  console.log("Enrollments seeded.");

  // Attendance
  for (const a of mockAttendance) {
    const attendanceDate = new Date(a.date);
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        studentId: a.studentId,
        courseId: a.courseId,
        date: attendanceDate,
      },
      select: { id: true },
    });

    if (existingAttendance) {
      await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status: a.status as "Present" | "Absent" | "Late",
          markedBy: a.markedBy,
        },
      });
      continue;
    }

    await prisma.attendance.create({
      data: {
        id: a.id,
        studentId: a.studentId,
        courseId: a.courseId,
        date: attendanceDate,
        status: a.status as "Present" | "Absent" | "Late",
        markedBy: a.markedBy,
      },
    });
  }
  console.log("Attendance seeded.");

  // Fees
  for (const f of mockFees) {
    await prisma.fee.create({
      data: {
        id: f.id,
        studentId: f.studentId,
        type: f.type,
        amount: f.amount,
        status: f.status as "Paid" | "Unpaid" | "Overdue",
        dueDate: new Date(f.dueDate),
        semester: f.semester,
        paidDate: f.paidDate ? new Date(f.paidDate) : null
      }
    });
  }

  // Announcements
  for (const a of mockAnnouncements) {
    await prisma.announcement.create({
      data: {
        id: a.id,
        title: a.title,
        content: a.content,
        author: a.author,
        date: new Date(a.date),
        audience: a.audience as "All" | "Students" | "Faculty",
        priority: a.priority as "High" | "Medium" | "Low"
      }
    })
  }

  // Feedback
  for (const f of mockFeedback) {
    await prisma.feedback.create({
      data: {
        id: f.id,
        studentId: f.studentId,
        type: f.type as "Faculty" | "Course",
        targetId: f.targetId,
        rating: f.rating,
        comment: f.comment,
        date: new Date(f.date)
      }
    })
  }

  // Timetable
  for (const t of mockTimetable) {
    await prisma.timetable.create({
      data: {
        id: t.id,
        courseId: t.courseId,
        room: t.room,
        day: t.day,
        startTime: t.startTime,
        endTime: t.endTime
      }
    })
  }

  // Quizzes
  for (const q of mockQuizzes) {
    await prisma.quiz.create({
      data: {
        id: q.id,
        title: q.title,
        courseId: q.courseId,
        createdBy: q.createdBy,
        duration: q.duration,
        totalMarks: q.totalMarks,
        status: q.status,
        dueDate: new Date(q.dueDate)
      }
    })
  }

  // Questions
  for (const q of mockQuestions) {
    // Find quiz that includes this question
    const parentQuiz = mockQuizzes.find(qz => qz.questions.includes(q.id));

    await prisma.question.create({
      data: {
        id: q.id,
        text: q.text,
        options: q.options,
        correctOption: q.correctOption,
        quizId: parentQuiz ? parentQuiz.id : mockQuizzes[0].id
      }
    })
  }

  // Attempts
  for (const a of mockQuizAttempts) {
    await prisma.quizAttempt.create({
      data: {
        id: a.id,
        quizId: a.quizId,
        studentId: a.studentId,
        score: a.score,
        totalMarks: a.totalMarks,
        submittedAt: new Date(a.submittedAt),
        answers: a.answers
      }
    })
  }

  // Grades 
  for (const g of mockGrades) {
    await prisma.grade.create({
      data: {
        id: g.id,
        studentId: g.studentId,
        courseId: g.courseId,
        quizMarks: g.quizMarks,
        assignmentMarks: g.assignmentMarks,
        midMarks: g.midMarks,
        finalMarks: g.finalMarks,
        total: g.total,
        gpa: g.gpa,
        locked: g.locked
      }
    })
  }

  // Admissions
  for (const a of mockAdmissions) {
    await prisma.admission.create({
      data: {
        id: a.id,
        studentName: a.studentName,
        email: a.email,
        phone: a.phone,
        appliedDepartment: a.appliedDepartment,
        applicationDate: new Date(a.applicationDate),
        status: a.status,
        fatherName: a.fatherName,
        cnic: a.cnic,
        previousInstitution: a.previousInstitution,
        marksObtained: a.marksObtained,
        totalMarks: a.totalMarks
      }
    })
  }

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });