-- AlterTable
ALTER TABLE "teacherCourses" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'english',
ADD COLUMN     "level" TEXT NOT NULL DEFAULT 'BEGINNER';

-- CreateIndex
CREATE INDEX "teacherCourses_level_idx" ON "teacherCourses"("level");

-- CreateIndex
CREATE INDEX "teacherCourses_language_idx" ON "teacherCourses"("language");
