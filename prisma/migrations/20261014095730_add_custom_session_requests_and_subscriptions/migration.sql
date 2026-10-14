/*
  Warnings:

  - You are about to drop the `teacherSubscription` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "teacherSubscription" DROP CONSTRAINT "teacherSubscription_studentId_fkey";

-- DropForeignKey
ALTER TABLE "teacherSubscription" DROP CONSTRAINT "teacherSubscription_teacherId_fkey";

-- AlterTable
ALTER TABLE "session_plans" ADD COLUMN     "validityDays" INTEGER DEFAULT 30;

-- DropTable
DROP TABLE "teacherSubscription";

-- CreateTable
CREATE TABLE "custom_session_requests" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "sessionsCount" INTEGER NOT NULL,
    "pricePerSession" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectedReason" TEXT,
    "respondedAt" TIMESTAMP(3),
    "validityDays" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_session_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_subscriptions" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "planId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "amount" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'plan',
    "sessionsCount" INTEGER NOT NULL DEFAULT 0,
    "sessionLeft" INTEGER NOT NULL DEFAULT 0,
    "sessionUsed" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_session_requests_teacherId_status_idx" ON "custom_session_requests"("teacherId", "status");

-- CreateIndex
CREATE INDEX "custom_session_requests_studentId_status_idx" ON "custom_session_requests"("studentId", "status");

-- CreateIndex
CREATE INDEX "teacher_subscriptions_teacherId_studentId_status_idx" ON "teacher_subscriptions"("teacherId", "studentId", "status");

-- AddForeignKey
ALTER TABLE "custom_session_requests" ADD CONSTRAINT "custom_session_requests_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_session_requests" ADD CONSTRAINT "custom_session_requests_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subscriptions" ADD CONSTRAINT "teacher_subscriptions_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subscriptions" ADD CONSTRAINT "teacher_subscriptions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subscriptions" ADD CONSTRAINT "teacher_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "session_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
