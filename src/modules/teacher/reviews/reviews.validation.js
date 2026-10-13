import joi from "joi";

export const getTeacherReviewsSchema = {
  query: joi.object({
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10),
    search: joi.string().trim().allow("").optional(),
  }),
};
