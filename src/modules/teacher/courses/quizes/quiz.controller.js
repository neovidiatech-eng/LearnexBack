import { asyncHandler, successResponse } from "../../../../utils/response.js"
import * as quizService from "./quiz.service.js"

export const createQuizController = asyncHandler(async (req, res, next) => {
    const {
        title,
        description,
        duration,
        passingScore,
        questions
    } = req.body;
    const { sectionId } = req.params;

    const quiz = await quizService.createQuiz({
        userId: req.user.id,
        sectionId,
        title,
        description,
        duration,
        passingScore,
        questions
    });
    return successResponse({
        res,
        status: 201,
        message: "QUIZ_CREATED_SUCCESSFULLY",
        data: quiz
    })
});

export const updateQuiz = asyncHandler(async(req,res,next)=>{
    const {sectionId} = req.params;

    const {title, description, duration, passingScore} = req.body;

    const quiz = await quizService.updateQuiz({
        userId: req.user.id,
        sectionId,
        title,
        description,
        duration,
        passingScore,
    });
    return successResponse({
        res,
        status: 200,
        message: "QUIZ_UPDATED_SUCCESSFULLY",
        data: quiz
    })
})

export  const updateQuestion = asyncHandler(async(req,res,next)=>{
    const {sectionId,questionId} = req.params;
    const {text,correctOptionId} = req.body;

    const question = await quizService.updateQuestion({
        userId: req.user.id,
        sectionId,
        questionId,
        text,
        correctOptionId,
    });

    return successResponse({
        res,
        status: 200,
        message: "QUESTION_UPDATED_SUCCESSFULLY",
        data: question
    })
});

export const getQuiz = asyncHandler(async(req,res,next)=>{
    const{sectionId} = req.params;
    const quiz = await quizService.getQuiz({
        userId: req.user.id,
        sectionId,
    });
    return successResponse({
        res,
        status: 200,
        message: "QUIZ_FETCHED_SUCCESSFULLY",
        data: quiz
    })
})



export const deleteQuiz = asyncHandler(async (req, res, next) => {
    const { sectionId } = req.params;

    await quizService.deleteQuiz({
        userId: req.user.id,
        sectionId,
    });

    return successResponse({
        res,
        status: 200,
        message: "QUIZ_DELETED_SUCCESSFULLY",
    });
});

// ─── Submission Controllers ───────────────────────────────────────────────────

export const getQuizSubmissionsController = asyncHandler(async (req, res, next) => {
    const { quizId } = req.params;

    const submissions = await quizService.getQuizSubmissions({
        userId: req.user.id,
        quizId,
    });

    return successResponse({
        res,
        status: 200,
        message: "SUBMISSIONS_FETCHED_SUCCESSFULLY",
        data: submissions,
    });
});

export const getSubmissionDetailsController = asyncHandler(async (req, res, next) => {
    const { quizId, submissionId } = req.params;

    const submission = await quizService.getSubmissionDetails({
        userId: req.user.id,
        quizId,
        submissionId,
    });

    return successResponse({
        res,
        status: 200,
        message: "SUBMISSION_DETAILS_FETCHED_SUCCESSFULLY",
        data: submission,
    });
});

export const gradeSubmissionController = asyncHandler(async (req, res, next) => {
    const { quizId, submissionId } = req.params;
    const { grades } = req.body;

    const submission = await quizService.gradeSubmission({
        userId: req.user.id,
        quizId,
        submissionId,
        grades,
    });

    return successResponse({
        res,
        status: 200,
        message: "SUBMISSION_GRADED_SUCCESSFULLY",
        data: submission,
    });
});