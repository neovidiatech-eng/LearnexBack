-- AlterTable
ALTER TABLE "teacherCourses" ADD COLUMN     "avgRating" DECIMAL(3,2) NOT NULL DEFAULT 0.0,
ADD COLUMN     "reviewsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalRevenue" DECIMAL(12,2) NOT NULL DEFAULT 0.0,
ADD COLUMN     "totalStudentsCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "teacher_course_enrollments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "progressPercent" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "teacher_course_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_course_reviews" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_course_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teacher_course_enrollments_courseId_idx" ON "teacher_course_enrollments"("courseId");

-- CreateIndex
CREATE INDEX "teacher_course_enrollments_studentId_idx" ON "teacher_course_enrollments"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_course_enrollments_studentId_courseId_key" ON "teacher_course_enrollments"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "teacher_course_reviews_courseId_idx" ON "teacher_course_reviews"("courseId");

-- CreateIndex
CREATE INDEX "teacher_course_reviews_studentId_idx" ON "teacher_course_reviews"("studentId");

-- CreateIndex
CREATE INDEX "teacher_course_reviews_isHidden_idx" ON "teacher_course_reviews"("isHidden");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_course_reviews_studentId_courseId_key" ON "teacher_course_reviews"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "teacherCourses_avgRating_idx" ON "teacherCourses"("avgRating");

-- CreateIndex
CREATE INDEX "teacherCourses_totalStudentsCount_idx" ON "teacherCourses"("totalStudentsCount");

-- AddForeignKey
ALTER TABLE "teacher_course_enrollments" ADD CONSTRAINT "teacher_course_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_course_enrollments" ADD CONSTRAINT "teacher_course_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "teacherCourses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_course_reviews" ADD CONSTRAINT "teacher_course_reviews_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_course_reviews" ADD CONSTRAINT "teacher_course_reviews_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "teacherCourses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_course_quiz_submissions" ADD CONSTRAINT "teacher_course_quiz_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
