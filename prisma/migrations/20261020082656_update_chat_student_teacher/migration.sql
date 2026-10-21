/*
  Warnings:

  - You are about to drop the column `unreadAdminCount` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `unreadUserCount` on the `conversations` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `conversations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,teacherId]` on the table `conversations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `studentId` to the `conversations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacherId` to the `conversations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "conversations" DROP CONSTRAINT "conversations_userId_fkey";

-- DropIndex
DROP INDEX "conversations_lastMessageAt_idx";

-- DropIndex
DROP INDEX "conversations_userId_key";

-- DropIndex
DROP INDEX "messages_senderId_idx";

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "unreadAdminCount",
DROP COLUMN "unreadUserCount",
DROP COLUMN "userId",
ADD COLUMN     "studentId" TEXT NOT NULL,
ADD COLUMN     "studentLastReadAt" TIMESTAMP(3),
ADD COLUMN     "teacherId" TEXT NOT NULL,
ADD COLUMN     "teacherLastReadAt" TIMESTAMP(3),
ADD COLUMN     "unreadStudentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unreadTeacherCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "conversations_studentId_lastMessageAt_idx" ON "conversations"("studentId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "conversations_teacherId_lastMessageAt_idx" ON "conversations"("teacherId", "lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_studentId_teacherId_key" ON "conversations"("studentId", "teacherId");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
