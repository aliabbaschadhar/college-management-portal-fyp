-- AlterTable
ALTER TABLE "Admission" ADD COLUMN     "selectedCourses" TEXT[],
ADD COLUMN     "semester" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "shift" TEXT NOT NULL DEFAULT 'Morning';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "shift" TEXT NOT NULL DEFAULT 'Morning';
