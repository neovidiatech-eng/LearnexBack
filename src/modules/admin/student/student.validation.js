import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";
import { userStatusEnum } from "../../../utils/Enums/userStatus.enum.js";

export const getAllStudents = {
  query: joi
    .object()
    .keys({
      page: joi.number().integer().min(1).default(1),
      limit: joi.number().integer().min(1).max(100).default(10),
      search: joi.string().trim().allow(""),
      status: joi
        .string()
        .valid(...Object.values(userStatusEnum)),
    })
    .options({ allowUnknown: false }),
};

export const getStudentById = {
  params: joi
    .object()
    .keys({
      studentId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const changeStatus = {
  params: joi
    .object()
    .keys({
      studentId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
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



export const createStudent = {
  body: joi
    .object()
    .keys({
      firstName: joi.string().min(2).max(50).trim().required(),
      lastName: joi.string().min(2).max(50).trim().required(),
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      phone: generalFields.phone.optional(),
      country: joi.string().min(2).max(100).trim().optional(),
      dateOfBirth: joi.date().iso().less("now").optional(),
      status: joi
        .string()
        .valid(...Object.values(userStatusEnum))
        .default(userStatusEnum.ACTIVE),
      notes: joi.string().max(1000).trim().optional(),
      courseIds: joi.array().items(generalFields.id).default([]),
    })
    .required()
    .options({ allowUnknown: false }),  
};
export const updateStudent = {
  params:changeStatus.params,
  body: createStudent.body
    .required()
    .options({ allowUnknown: false }),  
};
