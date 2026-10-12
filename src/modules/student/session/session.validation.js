import Joi from "joi";

export const createRequest = {
  params: Joi.object({
    teacherId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    startAt: Joi.date().iso().required(),
    note: Joi.string().trim().max(500).allow("", null).optional(),
  }).options({ allowUnknown: false }),
};

export const cancelRequest = {
  params: Joi.object({
    requestId: Joi.string().uuid().required(),
  }),
};
