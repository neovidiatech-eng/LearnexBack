import * as db from "../../../db/db.service.js";

const throwError = (message, status = 400) => {
  const err = new Error(message);
  err.cause = status;
  throw err;
};

/**
 * GET /student/quizzes/:quizId
 * Returns quiz questions & options WITHOUT revealing isCorrect.
 */
export const getStudentQuizService = async (userId, quizId) => {
  const quiz = await db.findOne({
    model: "teacherCourseQuiz",
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              questionId: true,
              text: true,
              order: true,
            },
          },
        },
      },
    },
  });

  if (!quiz) throwError("QUIZ_NOT_FOUND", 404);

  // Check if student has already submitted
  const existingSubmission = await db.findFirst({
    model: "teacherCourseQuizSubmission",
    where: { quizId, studentId: userId },
    select: {
      id: true,
      status: true,
      totalQuestions: true,
      correctCount: true,
      percentage: true,
      passed: true,
      submittedAt: true,
      gradedAt: true,
    },
  });

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    duration: quiz.duration,
    passingScore: quiz.passingScore,
    totalQuestions: quiz.questions.length,
    hasSubmitted: Boolean(existingSubmission),
    submission: existingSubmission || null,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      type: q.type,
      text: q.text,
      order: q.order,
      options: q.options || [],
    })),
  };
};

/**
 * POST /student/quizzes/:quizId/submit
 * Submits student answers, auto-grades MCQ/TRUE_FALSE questions,
 * marks PENDING_REVIEW if written questions exist, or GRADED if not.
 */
export const submitStudentQuizService = async (userId, quizId, { answers }) => {
  const quiz = await db.findOne({
    model: "teacherCourseQuiz",
    where: { id: quizId },
    include: {
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!quiz) throwError("QUIZ_NOT_FOUND", 404);

  // Check if already submitted
  const existingSubmission = await db.findFirst({
    model: "teacherCourseQuizSubmission",
    where: { quizId, studentId: userId },
  });

  if (existingSubmission) throwError("ALREADY_SUBMITTED", 409);

  let hasWritten = false;
  let correctCount = 0;

  const processedAnswers = [];

  for (const ans of answers) {
    const question = quiz.questions.find((q) => q.id === ans.questionId);
    if (!question) continue;

    if (question.type === "WRITTEN") {
      hasWritten = true;
      processedAnswers.push({
        questionId: question.id,
        writtenAnswer: ans.writtenAnswer || "",
        selectedOptionId: null,
        isCorrect: null, // pending review
      });
    } else {
      const selectedOption = question.options.find(
        (opt) => opt.id === ans.selectedOptionId
      );
      const isCorrect = selectedOption ? Boolean(selectedOption.isCorrect) : false;
      if (isCorrect) correctCount++;

      processedAnswers.push({
        questionId: question.id,
        selectedOptionId: ans.selectedOptionId || null,
        writtenAnswer: null,
        isCorrect,
      });
    }
  }

  const totalQuestions = quiz.questions.length;
  const isAutoGraded = !hasWritten;
  const percentage =
    isAutoGraded && totalQuestions > 0
      ? Number(((correctCount / totalQuestions) * 100).toFixed(2))
      : null;
  const passed = percentage !== null ? percentage >= quiz.passingScore : null;
  const status = isAutoGraded ? "GRADED" : "PENDING_REVIEW";

  const submission = await db.create({
    model: "teacherCourseQuizSubmission",
    data: {
      quizId,
      studentId: userId,
      status,
      totalQuestions,
      correctCount: isAutoGraded ? correctCount : null,
      percentage,
      passed,
      submittedAt: new Date(),
      gradedAt: isAutoGraded ? new Date() : null,
      answers: {
        create: processedAnswers,
      },
    },
    include: {
      answers: true,
    },
  });

  return submission;
};

/**
 * GET /student/quizzes/:quizId/my-submission
 * Returns student submission details and answers.
 */
export const getMySubmissionService = async (userId, quizId) => {
  const submission = await db.findFirst({
    model: "teacherCourseQuizSubmission",
    where: { quizId, studentId: userId },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          passingScore: true,
        },
      },
      answers: {
        include: {
          question: {
            include: {
              options: {
                orderBy: { order: "asc" },
              },
            },
          },
          selectedOption: true,
        },
      },
    },
  });

  if (!submission) throwError("SUBMISSION_NOT_FOUND", 404);

  return submission;
};
