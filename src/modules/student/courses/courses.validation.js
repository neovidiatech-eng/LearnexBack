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
    provider: joi
      .string()
      .valid("ALL", "PLATFORM", "TEACHER")
      .default("ALL")
      .optional(),
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10),
    locale: joi.string().valid("ar", "en", "fr").default("ar"),
  }),
};

export const getCourseCatalog = {
  query: joi.object({
    search: joi.string().allow("", null).optional(),
    provider: joi
      .string()
      .valid("ALL", "PLATFORM", "TEACHER")
      .default("ALL")
      .optional(),
    categoryId: joi.string().uuid().optional(),
    level: joi
      .string()
      .valid("BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS")
      .optional(),
    language: joi.string().optional(),
    minRating: joi.number().min(0).max(5).optional(),
    durationRange: joi
      .string()
      .valid("0-1", "1-3", "3-6", "6+", "extraShort", "short", "medium", "long")
      .optional(),
    minDuration: joi.number().min(0).optional(),
    maxDuration: joi.number().min(0).optional(),
    enrollmentType: joi.string().valid("FREE", "PAID").optional(),
    minPrice: joi.number().min(0).optional(),
    maxPrice: joi.number().min(0).optional(),
    hasCertificate: joi.boolean().optional(),
    sortBy: joi
      .string()
      .valid(
        "newest",
        "rating",
        "popular",
        "price_asc",
        "price_desc",
        "RATING_DESC",
        "rating_desc",
        "NEWEST",
        "POPULAR",
        "PRICE_ASC",
        "PRICE_DESC"
      )
      .default("newest"),
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10),
    locale: joi.string().valid("ar", "en", "fr").default("ar"),
  }),
};

export const getCourseFilters = {
  query: joi.object({
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
    itemType: joi.string().valid("COURSE", "TEACHER_COURSE").optional(),
  }),
};

export const completeLesson = {
  params: joi.object({
    courseId: joi.string().uuid().required(),
    lessonId: joi.string().uuid().required(),
  }),
};

export const getCourseReviews = {
  params: joi.object({
    courseId: joi.string().uuid().required(),
  }),
  query: joi.object({
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10),
    itemType: joi.string().valid("COURSE", "TEACHER_COURSE").optional(),
  }),
};
