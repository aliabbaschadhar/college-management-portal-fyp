-- CreateEnum
CREATE TYPE "ProgramLevel" AS ENUM ('BS', 'INTERMEDIATE');

-- AlterTable
ALTER TABLE "Admission" ADD COLUMN     "discipline" TEXT,
ADD COLUMN     "part" INTEGER,
ADD COLUMN     "programLevel" "ProgramLevel" NOT NULL DEFAULT 'BS',
ADD COLUMN     "subjectSet" TEXT;

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "programLevel" "ProgramLevel" NOT NULL DEFAULT 'BS';

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "programLevel" "ProgramLevel" NOT NULL DEFAULT 'BS';

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "assignedFacultyEvening" TEXT,
ADD COLUMN     "assignedFacultyMorning" TEXT,
ADD COLUMN     "discipline" TEXT,
ADD COLUMN     "part" INTEGER,
ADD COLUMN     "programLevel" "ProgramLevel" NOT NULL DEFAULT 'BS',
ADD COLUMN     "subjectSet" TEXT,
ADD COLUMN     "totalMarks" INTEGER DEFAULT 100;

-- AlterTable
ALTER TABLE "OnboardingRequest" ADD COLUMN     "discipline" TEXT,
ADD COLUMN     "part" INTEGER,
ADD COLUMN     "programLevel" "ProgramLevel" NOT NULL DEFAULT 'BS',
ADD COLUMN     "subjectSet" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "discipline" TEXT,
ADD COLUMN     "grade" TEXT,
ADD COLUMN     "gradesheetUrl" TEXT,
ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "leftDate" TIMESTAMP(3),
ADD COLUMN     "leftReason" TEXT,
ADD COLUMN     "obtainedMarks" INTEGER,
ADD COLUMN     "part" INTEGER,
ADD COLUMN     "percentage" DOUBLE PRECISION,
ADD COLUMN     "programLevel" "ProgramLevel" NOT NULL DEFAULT 'BS',
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active',
ADD COLUMN     "subjectSet" TEXT,
ADD COLUMN     "totalMarks" INTEGER;

-- CreateIndex
CREATE INDEX "Admission_programLevel_idx" ON "Admission"("programLevel");

-- CreateIndex
CREATE INDEX "Announcement_programLevel_idx" ON "Announcement"("programLevel");

-- CreateIndex
CREATE INDEX "AuditLog_programLevel_idx" ON "AuditLog"("programLevel");

-- CreateIndex
CREATE INDEX "Course_programLevel_idx" ON "Course"("programLevel");

-- CreateIndex
CREATE INDEX "Course_discipline_idx" ON "Course"("discipline");

-- CreateIndex
CREATE INDEX "Course_subjectSet_idx" ON "Course"("subjectSet");

-- CreateIndex
CREATE INDEX "Student_programLevel_idx" ON "Student"("programLevel");

-- CreateIndex
CREATE INDEX "Student_discipline_idx" ON "Student"("discipline");

-- CreateIndex
CREATE INDEX "Student_subjectSet_idx" ON "Student"("subjectSet");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_assignedFacultyMorning_fkey" FOREIGN KEY ("assignedFacultyMorning") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_assignedFacultyEvening_fkey" FOREIGN KEY ("assignedFacultyEvening") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
