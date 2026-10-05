/*
  Warnings:

  - You are about to drop the column `courseId` on the `course_favorites` table. All the data in the column will be lost.
  - You are about to drop the column `isFavourite` on the `course_favorites` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,itemId,itemType]` on the table `course_favorites` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemId` to the `course_favorites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemType` to the `course_favorites` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "course_favorites" DROP CONSTRAINT "course_favorites_courseId_fkey";

-- DropIndex
DROP INDEX "course_favorites_courseId_idx";

-- DropIndex
DROP INDEX "course_favorites_studentId_courseId_key";

-- DropIndex
DROP INDEX "course_favorites_studentId_isFavourite_idx";

-- AlterTable
ALTER TABLE "course_favorites" DROP COLUMN "courseId",
DROP COLUMN "isFavourite",
ADD COLUMN     "itemId" TEXT NOT NULL,
ADD COLUMN     "itemType" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Saved" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Saved_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "course_favorites_studentId_idx" ON "course_favorites"("studentId");

-- CreateIndex
CREATE INDEX "course_favorites_itemId_idx" ON "course_favorites"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "course_favorites_studentId_itemId_itemType_key" ON "course_favorites"("studentId", "itemId", "itemType");

-- AddForeignKey
ALTER TABLE "Saved" ADD CONSTRAINT "Saved_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
