-- AlterTable
ALTER TABLE "offers" ADD COLUMN "courseId" TEXT,
ADD COLUMN "teacherCourseId" TEXT;

-- CreateIndex
CREATE INDEX "offers_courseId_idx" ON "offers"("courseId");

-- CreateIndex
CREATE INDEX "offers_teacherCourseId_idx" ON "offers"("teacherCourseId");

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_teacherCourseId_fkey" FOREIGN KEY ("teacherCourseId") REFERENCES "teacherCourses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
