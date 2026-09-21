/*
  Warnings:

  - You are about to drop the column `description` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `isSystem` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `roles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "roles_name_key";

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "description",
DROP COLUMN "isSystem",
DROP COLUMN "name",
ADD COLUMN     "color" TEXT;

-- CreateTable
CREATE TABLE "RoleTranslation" (
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,

    CONSTRAINT "RoleTranslation_pkey" PRIMARY KEY ("roleId","lang")
);

-- AddForeignKey
ALTER TABLE "RoleTranslation" ADD CONSTRAINT "RoleTranslation_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
