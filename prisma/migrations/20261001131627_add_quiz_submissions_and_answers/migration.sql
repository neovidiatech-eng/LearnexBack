-- CreateTable
CREATE TABLE "teacher_course_quiz_submissions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "totalQuestions" INTEGER NOT NULL,
    "correctCount" INTEGER,
    "percentage" DECIMAL(5,2),
    "passed" BOOLEAN,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gradedAt" TIMESTAMP(3),

    CONSTRAINT "teacher_course_quiz_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_course_quiz_answers" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT,
    "writtenAnswer" TEXT,
    "isCorrect" BOOLEAN,
    "feedback" TEXT,

    CONSTRAINT "teacher_course_quiz_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teacher_course_quiz_submissions_quizId_status_idx" ON "teacher_course_quiz_submissions"("quizId", "status");

-- CreateIndex
CREATE INDEX "teacher_course_quiz_submissions_studentId_idx" ON "teacher_course_quiz_submissions"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_course_quiz_submissions_quizId_studentId_key" ON "teacher_course_quiz_submissions"("quizId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_course_quiz_answers_submissionId_questionId_key" ON "teacher_course_quiz_answers"("submissionId", "questionId");

-- AddForeignKey
ALTER TABLE "teacher_course_quiz_submissions" ADD CONSTRAINT "teacher_course_quiz_submissions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "teacher_course_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_course_quiz_answers" ADD CONSTRAINT "teacher_course_quiz_answers_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "teacher_course_quiz_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_course_quiz_answers" ADD CONSTRAINT "teacher_course_quiz_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "teacher_course_quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_course_quiz_answers" ADD CONSTRAINT "teacher_course_quiz_answers_selectedOptionId_fkey" FOREIGN KEY ("selectedOptionId") REFERENCES "teacher_course_quiz_options"("id") ON DELETE SET NULL ON UPDATE CASCADE;
