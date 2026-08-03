/*
  Warnings:

  - A unique constraint covering the columns `[courseCode,department]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Course_courseCode_key";

-- CreateIndex
CREATE UNIQUE INDEX "Course_courseCode_department_key" ON "Course"("courseCode", "department");
