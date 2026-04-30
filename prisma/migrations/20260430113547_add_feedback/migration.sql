/*
  Warnings:

  - A unique constraint covering the columns `[studentId,targetId,type]` on the table `Feedback` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ALTER COLUMN "adminId" DROP NOT NULL,
ALTER COLUMN "adminName" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "clerkId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_studentId_targetId_type_key" ON "Feedback"("studentId", "targetId", "type");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("clerkId") ON DELETE SET NULL ON UPDATE CASCADE;
