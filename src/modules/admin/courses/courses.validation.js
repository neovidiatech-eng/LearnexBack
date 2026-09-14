import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";
import {
  courseLevelEnum,
  courseStatusEnum,
  enrollmentTypeEnum,
  lessonTypeEnum,
} from "../../../utils/Enums/index.js";

export const lessonSchema = joi.object({
  title: joi.string().min(2).max(255).trim().required(),
  durationMinutes: joi.number().integer().min(0).default(0),
  duration: joi.number().min(0).optional(),
  type: joi
    .string()
    .valid(...Object.values(lessonTypeEnum))
    .default(lessonTypeEnum.VIDEO),
  contentUrl: joi.string().uri().allow("", null).optional(),
  description: joi.string().allow("", null).optional(),
  isFreePreview: joi.boolean().default(false),
  order: joi.number().integer().min(1).optional(),
});

export const sectionSchema = joi.object({
  title: joi.string().min(2).max(255).trim().required(),
  order: joi.number().integer().min(1).optional(),
  lessons: joi.array().items(lessonSchema).default([]),
});

export const createCourse = {
  body: joi
    .object({
      title: joi.string().min(3).max(255).trim().required(),
      description: joi.string().min(10).trim().required(),
      categoryId: generalFields.id.required(),
      category: joi.string().optional(),
      instructorId: generalFields.id.optional(),
      instructor: joi.string().optional(),
      level: joi
        .string()
        .valid(...Object.values(courseLevelEnum))
        .default(courseLevelEnum.BEGINNER),
      status: joi
        .string()
        .valid(...Object.values(courseStatusEnum))
        .default(courseStatusEnum.DRAFT),
      publishSettings: joi.string().optional(),
      enrollmentType: joi
        .string()
        .valid(...Object.values(enrollmentTypeEnum))
        .default(enrollmentTypeEnum.PAID),
      language: joi.string().trim().default("english"),
      originalPrice: joi.number().min(0).required(),
      salePrice: joi.number().min(0).allow(null).optional(),
      currency: joi.string().default("USD"),
      durationHours: joi.number().min(0).optional(),
      duration: joi.number().min(0).optional(),
      totalLessonsCount: joi.number().integer().min(0).optional(),
      lessons: joi.number().integer().min(0).optional(),
      tags: joi.array().items(joi.string().trim()).default([]),
      whatYouWillLearn: joi.array().items(joi.string().trim()).default([]),
      requirements: joi.array().items(joi.string().trim()).default([]),
      hasCertificate: joi.boolean().default(true),
      thumbnail: joi.string().uri().allow("", null).optional(),
      previewVideoUrl: joi.string().uri().allow("", null).optional(),
      scheduledAt: joi.date().iso().allow(null).optional(),
      sections: joi.array().items(sectionSchema).default([]),
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
      title: joi.string().min(3).max(255).trim(),
      description: joi.string().min(10).trim(),
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
      tags: joi.array().items(joi.string().trim()),
      whatYouWillLearn: joi.array().items(joi.string().trim()),
      requirements: joi.array().items(joi.string().trim()),
      hasCertificate: joi.boolean(),
      thumbnail: joi.string().uri().allow("", null),
      previewVideoUrl: joi.string().uri().allow("", null),
      scheduledAt: joi.date().iso().allow(null),
    })
    .min(1)
    .required(),
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