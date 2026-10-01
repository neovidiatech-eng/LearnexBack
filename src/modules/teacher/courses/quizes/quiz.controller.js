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

    const {title, description, duration, passingScore, questions} = req.body;

    const quiz = await quizService.updateQuiz({
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
        status: 200,
        message: "QUIZ_UPDATED_SUCCESSFULLY",
        data: quiz
    })
})

export  const updateQuestion = asyncHandler(async(req,res,next)=>{
    const {sectionId,questionId} = req.params;

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
})