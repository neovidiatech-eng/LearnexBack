/*
  Warnings:

  - You are about to drop the `certificates` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_studentId_fkey";

-- DropTable
DROP TABLE "certificates";

-- CreateTable
CREATE TABLE "student_certificates" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseType" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "achivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_certificates_courseId_key" ON "student_certificates"("courseId");

-- CreateIndex
CREATE INDEX "student_certificates_studentId_idx" ON "student_certificates"("studentId");

-- CreateIndex
CREATE INDEX "student_certificates_courseId_idx" ON "student_certificates"("courseId");

-- AddForeignKey
ALTER TABLE "student_certificates" ADD CONSTRAINT "student_certificates_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
