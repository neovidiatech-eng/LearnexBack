-- CreateTable
CREATE TABLE "course_favorites" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "isFavourite" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_favorites_studentId_courseId_key" ON "course_favorites"("studentId", "courseId");

-- CreateIndex
CREATE INDEX "course_favorites_studentId_isFavourite_idx" ON "course_favorites"("studentId", "isFavourite");

-- CreateIndex
CREATE INDEX "course_favorites_courseId_idx" ON "course_favorites"("courseId");

-- AddForeignKey
ALTER TABLE "course_favorites" ADD CONSTRAINT "course_favorites_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_favorites" ADD CONSTRAINT "course_favorites_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
