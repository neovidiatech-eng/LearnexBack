/*
  Warnings:

  - You are about to drop the column `adminId` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `notifications` table. All the data in the column will be lost.
  - Added the required column `receiverId` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverType` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_adminId_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";

-- DropIndex
DROP INDEX "notifications_userId_idx";

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "adminId",
DROP COLUMN "userId",
ADD COLUMN     "receiverId" TEXT NOT NULL,
ADD COLUMN     "receiverType" TEXT NOT NULL;
