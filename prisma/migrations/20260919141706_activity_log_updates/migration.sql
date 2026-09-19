/*
  Warnings:

  - You are about to drop the column `ipAdress` on the `activity_logs` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `activity_logs` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "activity_logs" DROP CONSTRAINT "activity_logs_userId_fkey";

-- DropIndex
DROP INDEX "activity_logs_userId_idx";

-- AlterTable
ALTER TABLE "activity_logs" DROP COLUMN "ipAdress",
DROP COLUMN "userId",
ADD COLUMN     "actorId" TEXT,
ADD COLUMN     "ipAddress" TEXT;

-- CreateIndex
CREATE INDEX "activity_logs_actorId_idx" ON "activity_logs"("actorId");
