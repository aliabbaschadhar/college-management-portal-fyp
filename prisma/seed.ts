import { PrismaClient } from "@prisma/client";
import {
  mockStudents,
  mockFaculty,
  mockCourses,
  mockAdmissions,
  mockAttendance,
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
} from "../src/lib/mock-data";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create Admins
  await prisma.user.create({
    data: {
      clerkId: "mock_clerk_admin_1",
      email: "test@gamil.com",
      name: "Admin Tester",
      role: "ADMIN",
      admin: {
        create: {}
      }
    }
  });
  console.log("Admin seeded.");

  // Iterate students
  for (const s of mockStudents) {
    await prisma.user.create({
      data: {
        clerkId: "mock_clerk_" + s.id,
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
    await prisma.user.create({
      data: {
        clerkId: "mock_clerk_" + f.id,
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
    // Looking at mockQuestions carefully, they actually map directly to a quiz through mockQuizzes questions list.
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