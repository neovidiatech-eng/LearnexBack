import joi from "joi";

export const addReviewSchema = {
  body: joi
    .object({
      type: joi.string().valid("COURSE", "TEACHER", "TEACHER_COURSE").optional(),
      courseId: joi.string().uuid().optional(),
      teacherId: joi.string().uuid().optional(),
      targetId: joi.string().uuid().optional(),
      rating: joi.number().integer().min(1).max(5).required(),
      comment: joi.string().trim().min(2).max(2000).allow("", null).optional(),
      bookingId: joi.string().uuid().allow(null).optional(),
    })
    .custom((value, helpers) => {
      const isCourse =
        value.type === "COURSE" ||
        value.type === "TEACHER_COURSE" ||
        Boolean(value.courseId);
      const isTeacher = value.type === "TEACHER" || Boolean(value.teacherId);

      if (value.type === "COURSE" || value.type === "TEACHER_COURSE") {
        if (!value.courseId && !value.targetId) {
          return helpers.message("courseId is required when type is COURSE or TEACHER_COURSE");
        }
      } else if (value.type === "TEACHER") {
        if (!value.teacherId && !value.targetId) {
          return helpers.message("teacherId is required when type is TEACHER");
        }
      } else {
        if (!value.courseId && !value.teacherId && !value.targetId) {
          return helpers.message("Either courseId or teacherId is required");
        }
        if (value.courseId && value.teacherId) {
          return helpers.message("Cannot provide both courseId and teacherId");
        }
      }
      return value;
    }),
};
