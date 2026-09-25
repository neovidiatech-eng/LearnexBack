import Joi from "joi";
import { generalFields } from "../../../../utils/validation/generalField.js";

export const createSectionSchema = {
    params:Joi.object({
        courseId:generalFields.id.required().messages({
            "string.empty": "COURSE_ID_EMPTY",
            "string.guid": "COURSE_ID_INVALID",
            "any.required": "COURSE_ID_REQUIRED",
        })
    
    }),
    body:Joi.object({
        name:generalFields.name.required().messages({
            "string.empty": "NAME_EMPTY",
            "string.guid": "NAME_INVALID",
            "any.required": "NAME_REQUIRED",
        }),
        order:generalFields.number.required().messages({
            "number.empty": "ORDER_EMPTY",
            "number.guid": "ORDER_INVALID",
            "any.required": "ORDER_REQUIRED",
        })
    })
}
export const getSectionsSchema = {
  params: Joi.object({
    courseId: generalFields.id.required().messages({
      "string.empty": "COURSE_ID_EMPTY",
      "string.guid": "COURSE_ID_INVALID",
      "any.required": "COURSE_ID_REQUIRED",
    }),
  }),
};

export const getSectionByIdSchema = {
  params: Joi.object({
    courseId: generalFields.id.required().messages({
      "string.empty": "COURSE_ID_EMPTY",
      "string.guid": "COURSE_ID_INVALID",
      "any.required": "COURSE_ID_REQUIRED",
    }),
    sectionId: generalFields.id.required().messages({
      "string.empty": "SECTION_ID_EMPTY",
      "string.guid": "SECTION_ID_INVALID",
      "any.required": "SECTION_ID_REQUIRED",
    }),
  }),
};

export const updateSectionSchema = {
  params: Joi.object({
    courseId: generalFields.id.required().messages({
      "string.empty": "COURSE_ID_EMPTY",
      "string.guid": "COURSE_ID_INVALID",
      "any.required": "COURSE_ID_REQUIRED",
    }),
    sectionId: generalFields.id.required().messages({
      "string.empty": "SECTION_ID_EMPTY",
      "string.guid": "SECTION_ID_INVALID",
      "any.required": "SECTION_ID_REQUIRED",
    }),
  }),
  body: Joi.object({
    name: generalFields.name.optional(),
    order: Joi.number().integer().min(1).optional(),
  })
    .min(1) 
    .messages({ "object.min": "AT_LEAST_ONE_FIELD_REQUIRED" }),
};

export const deleteSectionSchema = {
  params: Joi.object({
    courseId: generalFields.id.required().messages({
      "string.empty": "COURSE_ID_EMPTY",
      "string.guid": "COURSE_ID_INVALID",
      "any.required": "COURSE_ID_REQUIRED",
    }),
    sectionId: generalFields.id.required().messages({
      "string.empty": "SECTION_ID_EMPTY",
      "string.guid": "SECTION_ID_INVALID",
      "any.required": "SECTION_ID_REQUIRED",
    }),
  }),
};

export const reorderSectionsSchema = {
  params: Joi.object({
    courseId: generalFields.id.required().messages({
      "string.empty": "COURSE_ID_EMPTY",
      "string.guid": "COURSE_ID_INVALID",
      "any.required": "COURSE_ID_REQUIRED",
    }),
  }),
  body: Joi.object({
    sections: Joi.array()
      .items(
        Joi.object({
          id: generalFields.id.required(),
          order: Joi.number().integer().min(1).required(),
        })
      )
      .min(1)
      .required()
      .messages({
        "array.min": "SECTIONS_ARRAY_EMPTY",
        "any.required": "SECTIONS_ARRAY_REQUIRED",
      }),
  }),
};