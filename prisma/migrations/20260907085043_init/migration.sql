/*
  Warnings:

  - You are about to drop the column `slug` on the `courses` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "courses_slug_key";

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "slug";
