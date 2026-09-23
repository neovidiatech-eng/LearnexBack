import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";

export const teacherSignup = {
  body: joi
    .object()
    .keys({
      fullName: joi.string().min(2).max(100).trim().optional(),
      firstName: joi.string().min(2).max(50).trim().optional(),
      lastName: joi.string().min(2).max(50).trim().optional(),
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      phone: generalFields.phone.required(),
      experienceYears: joi.number().integer().min(0).max(70).default(0),
      linkedinUrl: joi.string().uri().allow("", null).optional(),
      subject: joi.string().min(2).max(100).trim().required(),
      headline: joi.string().max(200).trim().allow("", null).optional(),
      bio: joi.string().max(2000).trim().allow("", null).optional(),
      locale: joi.string().valid("ar", "en").default("ar").optional(),
    })
    .required()
    .options({ allowUnknown: true }),
};

export const login = {
  body: joi
    .object()
    .keys({
      email: generalFields.email.required(),
      password: generalFields.password.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};
