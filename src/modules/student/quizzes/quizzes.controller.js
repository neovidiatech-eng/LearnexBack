import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as quizService from "./quizzes.service.js";

/**
 * GET /student/quizzes/:quizId
 * Returns quiz details and questions for taking the test.
 */
export const getStudentQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.getStudentQuizService(
    req.user.id,
    req.params.quizId
  );
  return successResponse({ res, data: quiz });
});

/**
 * POST /student/quizzes/:quizId/submit
 * Submits the student's quiz answers.
 */
export const submitStudentQuiz = asyncHandler(async (req, res) => {
  const submission = await quizService.submitStudentQuizService(
    req.user.id,
    req.params.quizId,
    req.body
  );
  return successResponse({
    res,
    status: 201,
    message: "QUIZ_SUBMITTED_SUCCESSFULLY",
    data: submission,
  });
});

/**
 * GET /student/quizzes/:quizId/my-submission
 * Returns the student's submission and results.
 */
export const getMySubmission = asyncHandler(async (req, res) => {
  const submission = await quizService.getMySubmissionService(
    req.user.id,
    req.params.quizId
  );
  return successResponse({ res, data: submission });
});
