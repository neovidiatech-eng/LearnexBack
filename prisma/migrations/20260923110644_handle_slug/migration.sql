/*
  Warnings:

  - You are about to drop the column `slug` on the `RoleTranslation` table. All the data in the column will be lost.
  - Added the required column `slug` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RoleTranslation" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "slug" TEXT NOT NULL;
