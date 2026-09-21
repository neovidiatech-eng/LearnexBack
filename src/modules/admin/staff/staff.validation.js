import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";
import { userStatusEnum } from "../../../utils/Enums/userStatus.enum.js";

export const getAllStaff = {
  query: joi
    .object()
    .keys({
      page: joi.number().integer().min(1).default(1),
      limit: joi.number().integer().min(1).max(100).default(10),
      search: joi.string().trim().allow(""),
      status: joi.string().valid(...Object.values(userStatusEnum)),
      roleId: generalFields.id,
    })
    .options({ allowUnknown: false }),
};

export const getStaffById = {
  params: joi
    .object()
    .keys({
      staffId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const createStaff = {
  body: joi
    .object()
    .keys({
      firstName: joi.string().min(2).max(50).trim().required(),
      lastName: joi.string().min(2).max(50).trim().required(),
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      phone: generalFields.phone.optional(),
      country: joi.string().min(2).max(100).trim().optional(),
      status: joi
        .string()
        .valid(...Object.values(userStatusEnum))
        .default(userStatusEnum.ACTIVE),
      roleId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const updateStaff = {
  params: joi
    .object()
    .keys({
      staffId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
  body: joi
    .object()
    .keys({
      firstName: joi.string().min(2).max(50).trim(),
      lastName: joi.string().min(2).max(50).trim(),
      email: generalFields.email,
      password: generalFields.password,
      phone: generalFields.phone,
      country: joi.string().min(2).max(100).trim(),
      status: joi.string().valid(...Object.values(userStatusEnum)),
      roleId: generalFields.id,
    })
    .min(1)
    .required()
    .options({ allowUnknown: false }),
};

export const changeStatus = {
  params: joi
    .object()
    .keys({
      staffId: generalFields.id.required(),
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

export const deleteStaff = {
  params: joi
    .object()
    .keys({
      staffId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};
