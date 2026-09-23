import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";
import { userStatusEnum } from "../../../utils/Enums/userStatus.enum.js";

export const getAllTeachers = {
  query: joi
    .object()
    .keys({
      page: joi.number().integer().min(1).default(1),
      limit: joi.number().integer().min(1).max(100).default(10),
      search: joi.string().trim().allow(""),
      status: joi.string().valid(...Object.values(userStatusEnum)),
      subject: joi.string().trim().allow(""),
    })
    .options({ allowUnknown: false }),
};

export const getTeacherById = {
  params: joi
    .object()
    .keys({
      teacherId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const createTeacher = {
  body: joi
    .object()
    .keys({
      firstName: joi.string().min(2).max(50).trim().required(),
      lastName: joi.string().min(2).max(50).trim().required(),
      email: generalFields.email.required(),
      password: generalFields.password.optional(), 
      phone: generalFields.phone.required(),
      subject: joi.string().min(2).max(100).trim().required(),
      experienceYears: joi.number().integer().min(0).max(70).required(),
      status: joi
        .string()
        .valid(...Object.values(userStatusEnum))
        .default(userStatusEnum.ACTIVE),
      bio: joi.string().max(2000).trim().allow("", null).optional(),
      linkedinUrl: joi.string().uri().allow("", null).optional(),
      country: joi.string().min(2).max(100).trim().optional(),
      courseIds: joi.array().items(generalFields.id).optional().default([]),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const updateTeacher = {
  params: getTeacherById.params,
  body: joi
    .object()
    .keys({
      firstName: joi.string().min(2).max(50).trim().optional(),
      lastName: joi.string().min(2).max(50).trim().optional(),
      email: generalFields.email.optional(),
      password: generalFields.password.optional(),
      phone: generalFields.phone.optional(),
      subject: joi.string().min(2).max(100).trim().optional(),
      experienceYears: joi.number().integer().min(0).max(70).optional(),
      status: joi
        .string()
        .valid(...Object.values(userStatusEnum))
        .optional(),
      bio: joi.string().max(2000).trim().allow("", null).optional(),
      linkedinUrl: joi.string().uri().allow("", null).optional(),
      country: joi.string().min(2).max(100).trim().optional(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const changeStatus = {
  params: getTeacherById.params,
  body: joi
    .object()
    .keys({
      status: joi
        .string()
        .valid(...Object.values(userStatusEnum))
        .required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const assignCourses = {
  params: getTeacherById.params,
  body: joi
    .object()
    .keys({
      courseIds: joi.array().items(generalFields.id).required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const updateCv = {
  params: getTeacherById.params,
  file: joi.object(generalFields.file).required(),
};

//
export const getTeacherRequests = {
  query: joi
    .object({
      page: joi.number().integer().min(1).default(1),
      limit: joi.number().integer().min(1).max(100).default(10),
      status: joi
        .string()
        .valid(...Object.values(userStatusEnum))
        .optional(),
      search: joi.string().trim().allow("").optional(),
    })
    .options({ allowUnknown: false }),
};

export const getTeacherRequestDetails = {
  params: joi
    .object({
      teacherId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const approveTeacherConfirm = {
  params: joi
    .object({
      teacherId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};


export const rejectTeacherConfirm = {
  params: joi
    .object({
      teacherId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),

  body: joi
    .object({
      rejectionReason: joi.string().min(5).max(1000).trim().required(),
    })
    .required()
    .options({ allowUnknown: false }),
};
