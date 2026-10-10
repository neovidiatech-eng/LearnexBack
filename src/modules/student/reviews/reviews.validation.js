import joi from "joi";

export const addReviewSchema = {
  body: joi
    .object({
      courseId: joi.string().uuid(),
      teacherId: joi.string().uuid(),
      rating: joi.number().integer().min(1).max(5).required(),
      comment: joi.string().trim().min(2).max(2000).allow("", null),
      bookingId: joi.string().uuid().optional(), 
    })
    .xor("courseId", "teacherId"), 
};

export const getReviewsSchema = {
  query: joi
    .object({
      courseId: joi.string().uuid(),
      teacherId: joi.string().uuid(),
      page: joi.number().integer().min(1).default(1),
      limit: joi.number().integer().min(1).max(100).default(10),
    })
    .xor("courseId", "teacherId"),
};


