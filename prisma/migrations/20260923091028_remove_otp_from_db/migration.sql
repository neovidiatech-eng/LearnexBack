/*
  Warnings:

  - You are about to drop the column `confirmEmailOtp` on the `users` table. All the data in the column will be lost.
  - The `confirmEmail` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "confirmEmailOtp",
DROP COLUMN "confirmEmail",
ADD COLUMN     "confirmEmail" BOOLEAN NOT NULL DEFAULT false;
