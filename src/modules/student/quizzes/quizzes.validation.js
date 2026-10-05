import joi from "joi";

export const getQuiz = {
  params: joi.object({
    quizId: joi.string().uuid().required(),
  }),
};

export const submitQuiz = {
  params: joi.object({
    quizId: joi.string().uuid().required(),
  }),
  body: joi.object({
    answers: joi
      .array()
      .items(
        joi.object({
          questionId: joi.string().uuid().required(),
          selectedOptionId: joi.string().uuid().allow(null).optional(),
          writtenAnswer: joi.string().allow("", null).optional(),
        })
      )
      .min(1)
      .required(),
  }),
};

export const getMySubmission = {
  params: joi.object({
    quizId: joi.string().uuid().required(),
  }),
};
