
-- CreateTable
CREATE TABLE "teacher_course_quizzes" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "passingScore" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_course_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_course_quiz_questions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "teacher_course_quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_course_quiz_options" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,

    CONSTRAINT "teacher_course_quiz_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teacher_course_quizzes_sectionId_key" ON "teacher_course_quizzes"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_course_quiz_questions_quizId_order_key" ON "teacher_course_quiz_questions"("quizId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_course_quiz_options_questionId_order_key" ON "teacher_course_quiz_options"("questionId", "order");

-- AddForeignKey
ALTER TABLE "teacher_course_quizzes" ADD CONSTRAINT "teacher_course_quizzes_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "teacher_courses_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_course_quiz_questions" ADD CONSTRAINT "teacher_course_quiz_questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "teacher_course_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_course_quiz_options" ADD CONSTRAINT "teacher_course_quiz_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "teacher_course_quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
