-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "link" TEXT;

-- CreateIndex
CREATE INDEX "notifications_receiverId_idx" ON "notifications"("receiverId");

-- CreateIndex
CREATE INDEX "notifications_receiverType_idx" ON "notifications"("receiverType");

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "notifications"("priority");

-- CreateIndex
CREATE INDEX "notifications_readAt_idx" ON "notifications"("readAt");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");
