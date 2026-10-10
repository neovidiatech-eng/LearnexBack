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

export const getCourseCatalog = {
  query: joi.object({
    search: joi.string().allow("", null).optional(),
    categoryId: joi.string().uuid().optional(),
    level: joi
      .string()
      .valid("BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS")
      .optional(),
    enrollmentType: joi.string().valid("FREE", "PAID").optional(),
    minPrice: joi.number().min(0).optional(),
    maxPrice: joi.number().min(0).optional(),
    sortBy: joi
      .string()
      .valid("newest", "rating", "popular", "price_asc", "price_desc")
      .default("newest"),
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10),
    locale: joi.string().valid("ar", "en", "fr").default("ar"),
  }),
};

export const getCategories = {
  query: joi.object({
    locale: joi.string().valid("ar", "en", "fr").default("ar"),
  }),
};

export const getCourseDetails = {
  params: joi.object({
    courseId: joi.string().uuid().required(),
  }),
  query: joi.object({
    locale: joi.string().valid("ar", "en", "fr").default("ar"),
  }),
};

export const completeLesson = {
  params: joi.object({
    courseId: joi.string().uuid().required(),
    lessonId: joi.string().uuid().required(),
  }),
};

export const addCourseReview = {
  params: joi.object({
    courseId: joi.string().uuid().required(),
  }),
  body: joi.object({
    rating: joi.number().integer().min(1).max(5).required(),
    comment: joi.string().trim().min(2).max(2000).required(),
  }),
};

export const getCourseReviews = {
  params: joi.object({
    courseId: joi.string().uuid().required(),
  }),
  query: joi.object({
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10),
  }),
};

export const deleteCourseReview = {
  params: joi.object({
    courseId: joi.string().uuid().required(),
  }),
};