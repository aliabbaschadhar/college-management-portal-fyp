/*
  Warnings:

  - Added the required column `courseId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_quizId_fkey";

-- DropForeignKey
ALTER TABLE "QuizAttempt" DROP CONSTRAINT "QuizAttempt_quizId_fkey";

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "targetDepartment" TEXT,
ADD COLUMN     "targetSemester" INTEGER;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "shift" TEXT NOT NULL DEFAULT 'Morning';

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readmitRequested" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "marks" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "sampleAnswer" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'MCQ',
ALTER COLUMN "correctOption" DROP NOT NULL,
ALTER COLUMN "quizId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "QuizAttempt" ADD COLUMN     "courseCode" TEXT,
ADD COLUMN     "quizTitle" TEXT,
ALTER COLUMN "quizId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "cgpa" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "readmitRequested" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "FacultyAttendance" (
    "id" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "markedBy" TEXT NOT NULL DEFAULT 'SELF',
    "notes" TEXT,

    CONSTRAINT "FacultyAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FacultyAttendance_date_idx" ON "FacultyAttendance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "FacultyAttendance_facultyId_date_key" ON "FacultyAttendance"("facultyId", "date");

-- CreateIndex
CREATE INDEX "Question_courseId_idx" ON "Question"("courseId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacultyAttendance" ADD CONSTRAINT "FacultyAttendance_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
