-- AlterTable
ALTER TABLE "teachers" ADD COLUMN     "avgRating" DECIMAL(3,2) NOT NULL DEFAULT 0.0,
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "reviewsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sessionPrice50Min" DECIMAL(10,2) DEFAULT 0.0,
ADD COLUMN     "totalCoursesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalStudentsCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "coverPhoto" TEXT;

-- CreateTable
CREATE TABLE "teacher_certificates" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "issueDate" TIMESTAMP(3),
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_reviews" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teacher_certificates_teacherId_idx" ON "teacher_certificates"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_reviews_bookingId_key" ON "teacher_reviews"("bookingId");

-- CreateIndex
CREATE INDEX "teacher_reviews_teacherId_idx" ON "teacher_reviews"("teacherId");

-- CreateIndex
CREATE INDEX "teacher_reviews_studentId_idx" ON "teacher_reviews"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_reviews_studentId_teacherId_key" ON "teacher_reviews"("studentId", "teacherId");

-- AddForeignKey
ALTER TABLE "teacher_certificates" ADD CONSTRAINT "teacher_certificates_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_reviews" ADD CONSTRAINT "teacher_reviews_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_reviews" ADD CONSTRAINT "teacher_reviews_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
