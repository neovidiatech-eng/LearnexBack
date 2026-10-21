/*
  Warnings:

  - You are about to drop the column `teacherId` on the `support_tickets` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "support_tickets" DROP CONSTRAINT "support_tickets_teacherId_fkey";

-- AlterTable
ALTER TABLE "support_tickets" DROP COLUMN "teacherId";
