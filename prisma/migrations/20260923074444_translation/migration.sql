/*
  Warnings:

  - You are about to drop the column `bio` on the `teachers` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `teachers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "bio",
DROP COLUMN "subject",
ADD COLUMN     "rejectionReason" TEXT;

-- CreateTable
CREATE TABLE "teacher_translations" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,

    CONSTRAINT "teacher_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_translations_teacherId_locale_key" ON "teacher_translations"("teacherId", "locale");

-- AddForeignKey
ALTER TABLE "teacher_translations" ADD CONSTRAINT "teacher_translations_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
