import joi from "joi";

export const addToSaved = {
  body: joi.object({
    itemType: joi.string().valid("COURSE", "TEACHER_COURSE"),
    itemId: joi.string().uuid().required(),
  }),
};

export const removeFromSaved = {
  params: joi.object({
    itemId: joi.string().uuid().required(),
  }),
};
