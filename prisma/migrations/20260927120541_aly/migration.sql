/*
  Warnings:

  - A unique constraint covering the columns `[sectionId,order]` on the table `teacher_course_section_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `locale` to the `teacher_certificates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `teacher_certificates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teacher_certificates" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "headline" TEXT,
ADD COLUMN     "locale" TEXT NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "teacher_course_section_items" ALTER COLUMN "order" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "teacher_course_section_items_sectionId_order_key" ON "teacher_course_section_items"("sectionId", "order");
