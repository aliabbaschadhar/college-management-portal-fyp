import prisma from "./src/lib/prisma";

async function main() {
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  const facultyCount = await prisma.user.count({ where: { role: "FACULTY" } });
  const studentCount = await prisma.user.count({ where: { role: "STUDENT" } });
  const courseCount = await prisma.course.count();
  const feeCount = await prisma.fee.count();
  const attendanceCount = await prisma.attendance.count();
  const timetableCount = await prisma.timetable.count();
  const announcementsCount = await prisma.announcement.count();
  const quizCount = await prisma.quiz.count();
  const feedbackCount = await prisma.feedback.count();

  console.log(JSON.stringify({
    adminCount,
    facultyCount,
    studentCount,
    courseCount,
    feeCount,
    attendanceCount,
    timetableCount,
    announcementsCount,
    quizCount,
    feedbackCount
  }, null, 2));
}

main()
  .catch(console.error);
