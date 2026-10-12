/*
  Warnings:

  - A unique constraint covering the columns `[teacherId,title]` on the table `session_plans` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "session_plans_teacherId_title_key" ON "session_plans"("teacherId", "title");
