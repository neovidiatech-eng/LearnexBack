import joi from "joi";

export const toggleFavorite = {
  params: joi.object({
    courseId: joi.string().uuid().required(),
  }),
  body: joi.object({
    itemType: joi.string().valid("COURSE", "TEACHER_COURSE").required(),
  }),
};