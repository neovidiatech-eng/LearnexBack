/*
  Warnings:

  - You are about to drop the column `description` on the `session_plans` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `session_plans` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "session_plans_teacherId_title_key";

-- AlterTable
ALTER TABLE "session_plans" DROP COLUMN "description",
DROP COLUMN "title";

-- CreateTable
CREATE TABLE "session_plans_translations" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT,

    CONSTRAINT "session_plans_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_plans_translations_sessionId_idx" ON "session_plans_translations"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "session_plans_translations_sessionId_lang_key" ON "session_plans_translations"("sessionId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "session_plans_translations_sessionId_title_key" ON "session_plans_translations"("sessionId", "title");

-- AddForeignKey
ALTER TABLE "session_plans_translations" ADD CONSTRAINT "session_plans_translations_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "session_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
