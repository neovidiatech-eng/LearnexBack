import joi from "joi";
export const toggleFavorite = {
  params: joi.object({ courseId: joi.string().uuid().required() }),
  body: joi.object({ isFavourite: joi.boolean().required() }),
};