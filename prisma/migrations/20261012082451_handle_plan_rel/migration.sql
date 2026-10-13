-- AlterTable
ALTER TABLE "students" ADD COLUMN     "planId" TEXT,
ADD COLUMN     "sessionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sessionLeft" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sessionUsed" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT,
    "roomName" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GROUP',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_participants" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "joinedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "session_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sessions_roomName_key" ON "sessions"("roomName");

-- CreateIndex
CREATE INDEX "sessions_teacherId_startAt_idx" ON "sessions"("teacherId", "startAt");

-- CreateIndex
CREATE INDEX "sessions_status_idx" ON "sessions"("status");

-- CreateIndex
CREATE INDEX "session_participants_studentId_idx" ON "session_participants"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "session_participants_sessionId_studentId_key" ON "session_participants"("sessionId", "studentId");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_participants" ADD CONSTRAINT "session_participants_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_planId_fkey" FOREIGN KEY ("planId") REFERENCES "session_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
