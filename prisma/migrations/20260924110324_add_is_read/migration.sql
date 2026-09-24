/*
  Warnings:

  - You are about to drop the column `status` on the `notifications` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "notifications_status_idx";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "status",
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");
