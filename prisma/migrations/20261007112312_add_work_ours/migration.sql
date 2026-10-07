-- CreateTable
CREATE TABLE "teacher_work_hours" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "workHours" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_work_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teacher_work_hours_teacherId_idx" ON "teacher_work_hours"("teacherId");

-- AddForeignKey
ALTER TABLE "teacher_work_hours" ADD CONSTRAINT "teacher_work_hours_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
