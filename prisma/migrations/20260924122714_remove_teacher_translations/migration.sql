/*
  Warnings:

  - You are about to drop the `teacher_translations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `subject` to the `teachers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "teacher_translations" DROP CONSTRAINT "teacher_translations_teacherId_fkey";

-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "headline" TEXT,
ADD COLUMN     "subject" TEXT NOT NULL;

-- DropTable
DROP TABLE "teacher_translations";
