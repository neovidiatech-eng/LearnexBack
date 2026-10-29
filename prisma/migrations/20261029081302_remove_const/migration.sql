/*
  Warnings:

  - A unique constraint covering the columns `[studentId,courseId]` on the table `student_certificates` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "student_certificates_courseId_key";

-- CreateIndex
CREATE UNIQUE INDEX "student_certificates_studentId_courseId_key" ON "student_certificates"("studentId", "courseId");
