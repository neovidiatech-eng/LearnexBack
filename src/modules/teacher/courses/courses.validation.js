import Joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";

export const createCourseSchema = {
  body: Joi.object({
    name: generalFields.name.required(),

    description: generalFields.description.required(),

    price: generalFields.price.required(),

    totalHours: Joi.number().integer().min(0).required().messages({
      "number.base": "TOTAL_HOURS_NUMBER",
      "number.integer": "TOTAL_HOURS_INTEGER",
      "number.min": "TOTAL_HOURS_MIN",
      "any.required": "TOTAL_HOURS_REQUIRED",
    }),


  })
}

export const getTeacherCoursesSchema = {
  query: Joi.object({
    search: Joi.string().trim().optional(),
    page: generalFields.page.optional(),
    limit: generalFields.limit.optional(),
  }),
};
export const getCourseByIdSchema = {
  params: Joi.object({
    id: generalFields.id.required().messages({
      "string.empty": "COURSE_ID_EMPTY",
      "string.guid": "COURSE_ID_INVALID",
      "any.required": "COURSE_ID_REQUIRED",
    })
  })
}
export const updateCourseSchema = {
  params: Joi.object({
    id: generalFields.id.required(),
  }),

  body: Joi.object({
    name: generalFields.name.optional(),

    description: generalFields.description.optional(),

    price: generalFields.price.optional(),

    totalHours: Joi.number()
      .integer()
      .min(0)
      .optional()
      .messages({
        "number.base": "TOTAL_HOURS_NUMBER",
        "number.integer": "TOTAL_HOURS_INTEGER",
        "number.min": "TOTAL_HOURS_MIN",
      }),
  })
};