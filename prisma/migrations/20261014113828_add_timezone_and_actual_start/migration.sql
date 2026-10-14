/*
  Warnings:

  - A unique constraint covering the columns `[teacherId]` on the table `teacher_work_hours` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "actualStartAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "teacher_subscriptions" ALTER COLUMN "type" SET DEFAULT 'PLAN';

-- AlterTable
ALTER TABLE "teacher_work_hours" ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Africa/Cairo';

-- CreateIndex
CREATE UNIQUE INDEX "teacher_work_hours_teacherId_key" ON "teacher_work_hours"("teacherId");
