-- AlterTable
ALTER TABLE "course_reviews" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "teacher_reviews" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "teachers" ALTER COLUMN "subject" DROP NOT NULL;

-- CreateTable
CREATE TABLE "session_plans" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sessionsCount" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "discountType" TEXT,
    "discountValue" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "session_plans_teacherId_idx" ON "session_plans"("teacherId");

-- CreateIndex
CREATE INDEX "course_reviews_studentId_idx" ON "course_reviews"("studentId");

-- CreateIndex
CREATE INDEX "course_reviews_isHidden_idx" ON "course_reviews"("isHidden");

-- CreateIndex
CREATE INDEX "teacher_reviews_isHidden_idx" ON "teacher_reviews"("isHidden");

-- AddForeignKey
ALTER TABLE "session_plans" ADD CONSTRAINT "session_plans_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
