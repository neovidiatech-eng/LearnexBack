import Joi from "joi";

export const getSessions = {
  query: Joi.object({
    tab: Joi.string().valid("today", "upcoming", "history").default("today"),
    search: Joi.string().trim().max(100).allow("", null).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export const getSessionById = {
  params: Joi.object({
    sessionId: Joi.string().uuid().required(),
  }),
};
