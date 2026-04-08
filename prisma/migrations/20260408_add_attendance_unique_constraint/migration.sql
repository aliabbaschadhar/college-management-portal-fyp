-- AddUniqueConstraint: Attendance(studentId, courseId, date)
-- This prevents duplicate attendance records for the same student, course, and date
-- and enables efficient upsert operations.

CREATE UNIQUE INDEX "Attendance_studentId_courseId_date_key"
  ON "Attendance"("studentId", "courseId", "date");
