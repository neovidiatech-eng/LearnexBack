/*
  Warnings:

  - You are about to drop the column `coursesCount` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `studentsCount` on the `categories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "coursesCount",
DROP COLUMN "studentsCount";
