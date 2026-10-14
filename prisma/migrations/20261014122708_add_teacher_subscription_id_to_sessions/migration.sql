-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "teacherSubscriptionId" TEXT;

-- CreateIndex
CREATE INDEX "sessions_teacherSubscriptionId_idx" ON "sessions"("teacherSubscriptionId");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_teacherSubscriptionId_fkey" FOREIGN KEY ("teacherSubscriptionId") REFERENCES "teacher_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
