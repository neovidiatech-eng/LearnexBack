import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";

export const updateProfile = {
  body: joi
    .object({
      fullName: joi.string().min(2).max(100).trim().optional(),
      email: generalFields.email.optional(),
      phone: joi.string().trim().optional(),
    })
    .options({ allowUnknown: false }),
};

export const changePassword = {
  body: joi
    .object({
      password: generalFields.password.required(),
      oldPassword: generalFields.password.required(),
    })
    .options({ allowUnknown: false }),
};
