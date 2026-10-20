/*
  Warnings:

  - Added the required column `userId` to the `support_tickets` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "support_tickets" DROP CONSTRAINT "support_tickets_teacherId_fkey";

-- DropIndex
DROP INDEX "support_tickets_teacherId_status_updatedAt_idx";

-- AlterTable
ALTER TABLE "support_tickets" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "teacherId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "support_tickets_userId_status_updatedAt_idx" ON "support_tickets"("userId", "status", "updatedAt");

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
