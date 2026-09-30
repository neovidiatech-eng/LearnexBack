/*
  Warnings:

  - You are about to drop the column `issueDate` on the `teacher_certificates` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sectionId,order]` on the table `teacher_course_section_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileType` to the `teacher_certificates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issueYear` to the `teacher_certificates` table without a default value. This is not possible if the table is not empty.
  - Made the column `issuer` on table `teacher_certificates` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "teacher_certificates" DROP COLUMN "issueDate",
ADD COLUMN     "fileSize" TEXT,
ADD COLUMN     "fileType" TEXT NOT NULL,
ADD COLUMN     "issueYear" INTEGER NOT NULL,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'ACADEMIC',
ALTER COLUMN "issuer" SET NOT NULL;

-- AlterTable
ALTER TABLE "teacher_course_section_items" ALTER COLUMN "order" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "teacher_certificates_type_idx" ON "teacher_certificates"("type");

-- CreateIndex
CREATE INDEX "teacher_certificates_status_idx" ON "teacher_certificates"("status");
