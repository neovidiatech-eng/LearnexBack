-- CreateTable
CREATE TABLE "teacherCourses" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "wallPaper" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "totalHours" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacherCourses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_courses_sections" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_courses_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_course_section_items" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "materialType" TEXT NOT NULL,
    "materialLink" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_course_section_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teacherCourses_teacherId_idx" ON "teacherCourses"("teacherId");

-- CreateIndex
CREATE INDEX "teacherCourses_status_idx" ON "teacherCourses"("status");

-- CreateIndex
CREATE INDEX "teacher_courses_sections_courseId_idx" ON "teacher_courses_sections"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_courses_sections_courseId_order_key" ON "teacher_courses_sections"("courseId", "order");

-- CreateIndex
CREATE INDEX "teacher_course_section_items_sectionId_idx" ON "teacher_course_section_items"("sectionId");

-- AddForeignKey
ALTER TABLE "teacherCourses" ADD CONSTRAINT "teacherCourses_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_courses_sections" ADD CONSTRAINT "teacher_courses_sections_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "teacherCourses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_course_section_items" ADD CONSTRAINT "teacher_course_section_items_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "teacher_courses_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
