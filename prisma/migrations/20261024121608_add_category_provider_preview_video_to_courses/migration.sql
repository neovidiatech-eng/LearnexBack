-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'PLATFORM';

-- AlterTable
ALTER TABLE "teacherCourses" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "previewVideoUrl" TEXT,
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'TEACHER';

-- CreateIndex
CREATE INDEX "teacherCourses_categoryId_idx" ON "teacherCourses"("categoryId");

-- AddForeignKey
ALTER TABLE "teacherCourses" ADD CONSTRAINT "teacherCourses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
