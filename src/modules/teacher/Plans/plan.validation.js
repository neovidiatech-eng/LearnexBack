import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";

import { days } from "../../../utils/Enums/days.js";

const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const toggleVisibility = {
  body: joi
    .object({
      isAvailable: joi.boolean().optional(),
    })
    .options({ allowUnknown: false }),
};

export const updateProfile = {
  body: joi
    .object({
      fullName: joi.string().min(2).max(100).trim().optional(),
      email: generalFields.email.optional(),
      phone: joi.string().trim().optional(),
      country: joi.string().min(2).max(100).trim().optional(),
      subject: joi.string().min(2).max(100).trim().optional(),
      headline: joi.string().max(200).trim().allow("", null).optional(),
      bio: joi.string().max(2000).trim().allow("", null).optional(),
      experienceYears: joi.number().integer().min(0).max(70).optional(),
      linkedinUrl: joi.string().uri().allow("", null).optional(),
      sessionPrice50Min: joi.number().min(0).optional(),
      currency: joi.string().max(10).optional(),
    })
    .options({ allowUnknown: false }),
};

export const updateWorkHours = {
  body: joi
    .object({
      workHours: joi
        .array()
        .items(
          joi.object({
            day: joi
              .string()
              .valid(...days)
              .required(),
            slots: joi
              .array()
              .items(
                joi.object({
                  startTime: joi.string().regex(timePattern).required(),
                  endTime: joi.string().regex(timePattern).required(),
                }),
              )
              .required(),
          }),
        )
        .required(),
    })
    .options({ allowUnknown: false }),
};
