import joi from "joi";

export const toggleFavorite = {
  params: joi.object({
    courseId: joi.string().uuid().required(),
  }),
  body: joi.object({
    itemType: joi.string().valid("COURSE", "TEACHER_COURSE").required(),
  }),
};

export const enrollCourse = {
  params: joi.object({
    courseId: joi.string().uuid().required(),
  }),
};

export const getEnrolledCourses = {
  query: joi.object({
    search: joi.string().allow("", null).optional(),
    status: joi.string().valid("ACTIVE", "COMPLETED", "CANCELLED").optional(),
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10),
    locale: joi.string().valid("ar", "en", "fr").default("ar"),
  }),
};