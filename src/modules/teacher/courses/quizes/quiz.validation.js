import Joi from "joi";
import { generalFields } from "../../../../utils/validation/generalField.js";

const quizOptionSchema = Joi.object({

    text: Joi.string()
        .trim()
        .min(1)
        .max(255)
        .required()
        .messages({
            "string.base": "OPTION_TEXT_STRING",
            "string.empty": "OPTION_TEXT_EMPTY",
            "string.min": "OPTION_TEXT_MIN",
            "string.max": "OPTION_TEXT_MAX",
            "any.required": "OPTION_TEXT_REQUIRED",
        }),

    isCorrect: Joi.boolean()
        .required()
        .messages({
            "boolean.base": "OPTION_CORRECT_BOOLEAN",
            "any.required": "OPTION_CORRECT_REQUIRED",
        }),

});

const quizQuestionSchema = Joi.object({

    type: Joi.string()
        .valid("MCQ", "TRUE_FALSE", "WRITTEN")
        .required()
        .messages({
            "string.base": "QUESTION_TYPE_STRING",
            "string.empty": "QUESTION_TYPE_EMPTY",
            "any.only": "QUESTION_TYPE_INVALID",
            "any.required": "QUESTION_TYPE_REQUIRED",
        }),

    text: Joi.string()
        .trim()
        .min(1)
        .max(1000)
        .required()
        .messages({
            "string.base": "QUESTION_TEXT_STRING",
            "string.empty": "QUESTION_TEXT_EMPTY",
            "string.min": "QUESTION_TEXT_MIN",
            "string.max": "QUESTION_TEXT_MAX",
            "any.required": "QUESTION_TEXT_REQUIRED",
        }),

    options: Joi.array()
        .items(quizOptionSchema)
        .optional()
        .messages({
            "array.base": "QUESTION_OPTIONS_ARRAY",
        }),

});

export const createQuizSchema = {

    body: Joi.object({

        title: generalFields.name.required(),

        description: Joi.string()
            .trim()
            .max(1000)
            .allow("")
            .optional()
            .messages({
                "string.base": "DESCRIPTION_STRING",
                "string.max": "DESCRIPTION_MAX",
            }),

        duration: generalFields.duration.required(),

        passingScore: Joi.number()
            .integer()
            .min(0)
            .max(100)
            .required()
            .messages({
                "number.base": "PASSING_SCORE_NUMBER",
                "number.integer": "PASSING_SCORE_INTEGER",
                "number.min": "PASSING_SCORE_MIN",
                "number.max": "PASSING_SCORE_MAX",
                "any.required": "PASSING_SCORE_REQUIRED",
            }),

        questions: Joi.array()
            .min(1)
            .required()
            .items(quizQuestionSchema)
            .messages({
                "array.base": "QUESTIONS_ARRAY",
                "array.min": "QUESTIONS_MIN",
                "any.required": "QUESTIONS_REQUIRED",
            }),

    }),

};

export const updateQuizSchema = {
    body: Joi.object({
        title: Joi.string().trim().min(1),
        description: Joi.string().trim().allow("", null),
        duration: Joi.number().integer().positive(),
        passingScore: Joi.number().integer().min(0).max(100),
    }).min(1),

    params: Joi.object({
        sectionId: generalFields.id.required(),
    }),
};

export const updateQuestionSchema = {

    body: Joi.object({

        text: Joi.string()
            .trim()
            .min(1)
            .max(1000)
            .optional()
            .messages({
                "string.base": "QUESTION_TEXT_STRING",
                "string.empty": "QUESTION_TEXT_EMPTY",
                "string.min": "QUESTION_TEXT_MIN",
                "string.max": "QUESTION_TEXT_MAX",
            }),

        correctOptionId: generalFields.id
            .optional(),

    }),

    params: Joi.object({

        sectionId: generalFields.id.required(),

        questionId: generalFields.id.required(),

    }),

};

export const quizParamsSchema = {
    params: Joi.object({
        sectionId: generalFields.id.required(),
    }),
};