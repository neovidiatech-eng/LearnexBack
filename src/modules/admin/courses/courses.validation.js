import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";
import {
  courseLevelEnum,
  courseStatusEnum,
  enrollmentTypeEnum,
  lessonTypeEnum,
} from "../../../utils/Enums/index.js";
import { jsonArray } from "../../../utils/validation/jsonField.js";

const translationSchema = joi.object({
  locale: joi.string().valid("en", "ar", "fr").required(),
  title: joi.string().min(3).max(255).trim().required(),
  description: joi.string().min(10).trim().required(),
  whatYouWillLearn: jsonArray(joi.string().trim()).default([]),
  requirements: jsonArray(joi.string().trim()).default([]),
});

const sectionTranslationSchema = joi.object({
  locale: joi.string().valid("en", "ar", "fr").required(),
  title: joi.string().min(2).max(255).trim().required(),
});

const lessonTranslationSchema = joi.object({
  locale: joi.string().valid("en", "ar", "fr").required(),
  title: joi.string().min(2).max(255).trim().required(),
  description: joi.string().allow("", null).optional(),
});

const lessonSchema = joi.object({
  order: joi.number().integer().min(1).optional(),
  durationMinutes: joi.number().integer().min(0).default(0),
  type: joi
    .string()
    .valid(...Object.values(lessonTypeEnum))
    .default(lessonTypeEnum.VIDEO),
  contentUrl: joi.string().uri().allow("", null).optional(),
  isFreePreview: joi.boolean().default(false),
  translations: jsonArray(lessonTranslationSchema, { required: true }),
});

const sectionSchema = joi.object({
  order: joi.number().integer().min(1).optional(),
  translations: jsonArray(sectionTranslationSchema, { required: true }),
  lessons: jsonArray(lessonSchema).default([]),
});

export const createCourse = {
  body: joi
    .object({
      categoryId: generalFields.id.required(),
      instructorId: generalFields.id.optional(),
      level: joi
        .string()
        .valid(...Object.values(courseLevelEnum))
        .default(courseLevelEnum.BEGINNER),
      status: joi
        .string()
        .valid(...Object.values(courseStatusEnum))
        .default(courseStatusEnum.DRAFT),
      enrollmentType: joi
        .string()
        .valid(...Object.values(enrollmentTypeEnum))
        .default(enrollmentTypeEnum.PAID),
      language: joi.string().trim().default("english"),
      originalPrice: joi.number().min(0).required(),
      salePrice: joi.number().min(0).allow(null).optional(),
      currency: joi.string().default("USD"),
      durationHours: joi.number().min(0).optional(),
      totalLessonsCount: joi.number().integer().min(0).optional(),
      tags: jsonArray(joi.string().trim()).default([]),
      hasCertificate: joi.boolean().default(true),
      scheduledAt: joi.date().iso().allow(null).optional(),
      translations: jsonArray(translationSchema, { required: true }),
      sections: jsonArray(sectionSchema).default([]),
    })
    .required(),
};

export const updateCourse = {
  params: joi
    .object({
      courseId: generalFields.id.required(),
    })
    .required(),
  body: joi
    .object({
      categoryId: generalFields.id,
      instructorId: generalFields.id,
      level: joi.string().valid(...Object.values(courseLevelEnum)),
      status: joi.string().valid(...Object.values(courseStatusEnum)),
      enrollmentType: joi.string().valid(...Object.values(enrollmentTypeEnum)),
      language: joi.string().trim(),
      originalPrice: joi.number().min(0),
      salePrice: joi.number().min(0).allow(null),
      currency: joi.string(),
      durationHours: joi.number().min(0),
      totalLessonsCount: joi.number().integer().min(0),
      tags: jsonArray(joi.string().trim()), 
      hasCertificate: joi.boolean(),
      scheduledAt: joi.date().iso().allow(null),
      translations: jsonArray(translationSchema),
      sections: jsonArray(sectionSchema), 
    })
    .min(1)
    .required(),
  files: joi
    .object({
      thumbnail: joi
        .array()
        .items(joi.object(generalFields.file).unknown(true))
        .optional(),
      previewVideo: joi
        .array()
        .items(joi.object(generalFields.file).unknown(true))
        .optional(),
    })
    .unknown(true)
    .optional(),
};

export const updateCourseStatus = {
  params: joi
    .object({
      courseId: generalFields.id.required(),
    })
    .required(),
  body: joi
    .object({
      status: joi
        .string()
        .valid(...Object.values(courseStatusEnum))
        .required(),
    })
    .required(),
};

export const getAllCourses = {
  query: joi.object({
    search: joi.string().trim().optional(),
    categoryId: generalFields.id.optional(),
    instructorId: generalFields.id.optional(),
    level: joi
      .string()
      .valid(...Object.values(courseLevelEnum))
      .optional(),
    status: joi
      .string()
      .valid(...Object.values(courseStatusEnum))
      .optional(),
    enrollmentType: joi
      .string()
      .valid(...Object.values(enrollmentTypeEnum))
      .optional(),
    language: joi.string().trim().optional(),
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10),
    sort: joi
      .string()
      .valid(
        "newest",
        "oldest",
        "price_asc",
        "price_desc",
        "rating",
        "students",
      )
      .default("newest"),
  }),
};

export const getCourseById = {
  params: joi
    .object({
      courseId: generalFields.id.required(),
    })
    .required(),
};

export const deleteCourse = {
  params: joi
    .object({
      courseId: generalFields.id.required(),
    })
    .required(),
};

export const createSection = {
  params: joi
    .object({
      courseId: generalFields.id.required(),
    })
    .required(),
  body: joi
    .object({
      title: joi.string().min(2).max(255).trim().required(),
      order: joi.number().integer().min(1).optional(),
    })
    .required(),
};

export const updateSection = {
  params: joi
    .object({
      sectionId: generalFields.id.required(),
    })
    .required(),
  body: joi
    .object({
      title: joi.string().min(2).max(255).trim(),
      order: joi.number().integer().min(1),
    })
    .min(1)
    .required(),
};

export const deleteSection = {
  params: joi
    .object({
      sectionId: generalFields.id.required(),
    })
    .required(),
};

export const createLesson = {
  params: joi
    .object({
      sectionId: generalFields.id.required(),
    })
    .required(),
  body: lessonSchema.required(),
};

export const updateLesson = {
  params: joi
    .object({
      lessonId: generalFields.id.required(),
    })
    .required(),
  body: joi
    .object({
      title: joi.string().min(2).max(255).trim(),
      durationMinutes: joi.number().integer().min(0),
      type: joi.string().valid(...Object.values(lessonTypeEnum)),
      contentUrl: joi.string().uri().allow("", null),
      description: joi.string().allow("", null),
      isFreePreview: joi.boolean(),
      order: joi.number().integer().min(1),
    })
    .min(1)
    .required(),
};

export const deleteLesson = {
  params: joi
    .object({
      lessonId: generalFields.id.required(),
    })
    .required(),
};
