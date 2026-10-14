/*
  Warnings:

  - You are about to drop the column `type` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the `session_participants` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[requestId]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `requestId` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "session_participants" DROP CONSTRAINT "session_participants_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "session_participants" DROP CONSTRAINT "session_participants_studentId_fkey";

-- AlterTable
ALTER TABLE "offers" ALTER COLUMN "target" SET DEFAULT 'ALL_USERS';

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "type",
ADD COLUMN     "requestId" TEXT NOT NULL,
ADD COLUMN     "studentId" TEXT NOT NULL,
ADD COLUMN     "studentJoinedAt" TIMESTAMP(3),
ADD COLUMN     "studentLeftAt" TIMESTAMP(3),
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "roomName" DROP NOT NULL;

-- DropTable
DROP TABLE "session_participants";

-- CreateTable
CREATE TABLE "session_requests" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectedReason" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_requests_teacherId_status_startAt_idx" ON "session_requests"("teacherId", "status", "startAt");

-- CreateIndex
CREATE INDEX "session_requests_studentId_status_idx" ON "session_requests"("studentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_requestId_key" ON "sessions"("requestId");

-- CreateIndex
CREATE INDEX "sessions_studentId_startAt_idx" ON "sessions"("studentId", "startAt");

-- AddForeignKey
ALTER TABLE "session_requests" ADD CONSTRAINT "session_requests_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_requests" ADD CONSTRAINT "session_requests_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "session_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
