import joi from "joi";

export const addToCart = {
  body: joi.object({
    type: joi.string().valid("COURSE", "TEACHER_COURSE").required(),
    itemId: joi.string().uuid().required(),
  }),
};

export const removeFromCart = {
  params: joi.object({
    itemId: joi.string().uuid().required(),
  }),
};

export const checkoutCart = {
  body: joi.object({
    paymentMethod: joi.string().valid("CARD", "CASH").default("CARD"),
  }),
};
