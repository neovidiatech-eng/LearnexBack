import { asyncHandler } from "../utils/response.js";
import joi from "joi";

export const generalFields = {
  fullName: joi
    .string()
    .min(2)
    .max(50)
    .trim()
    .messages({
      "string.min": "FULL_NAME_MIN_LENGTH",
      "string.max": "FULL_NAME_MAX_LENGTH",
      "any.required": "FULL_NAME_REQUIRED",
    }),

  email: joi
    .string()
    .email()
    .trim()
    .lowercase()
    .messages({
      "string.email": "INVALID_EMAIL_FORMAT",
      "any.required": "EMAIL_REQUIRED",
    }),

  password: joi
    .string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/))
    .messages({
      "string.pattern.base": "INVALID_PASSWORD_FORMAT",
      "any.required": "PASSWORD_REQUIRED",
    }),

  phone: joi
    .string()
    .pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/))
    .messages({
      "string.pattern.base": "INVALID_PHONE_FORMAT",
      "any.required": "PHONE_REQUIRED",
    }),

  confirmPassword: joi
    .string()
    .valid(joi.ref("password"))
    .messages({
      "any.only": "PASSWORDS_DO_NOT_MATCH",
      "any.required": "CONFIRM_PASSWORD_REQUIRED",
    }),

  otp: joi
    .string()
    .pattern(new RegExp(/^\d{6}$/))
    .messages({
      "string.pattern.base": "INVALID_OTP_FORMAT",
      "any.required": "OTP_REQUIRED",
    }),

  id: joi
    .string()
    .uuid()
    .messages({
      "string.guid": "INVALID_ID_FORMAT",
      "any.required": "ID_REQUIRED",
    }),

  file: {
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().required(),
    destination: joi.string().required(),
    filename: joi.string().required(),
    path: joi.string().required(),
    size: joi.number().positive().required(),
    relativeDestination: joi.string().optional(),
  },
};

export const validation = (schema) => {
  return asyncHandler(async (req, res, next) => {
    const validationError = [];
    for (const key of Object.keys(schema)) {
      const validationResult = schema[key].validate(req[key], {
        abortEarly: false,
      });
      if (validationResult.error) {
        validationError.push({
          key,
          details: validationResult.error.details.map((element) => {
            return { message: element.message, path: element.path[0] };
          }),
        });
      }
    }
    if (validationError.length) {
      return res
        .status(400)
        .json({ error_message: "VALIDATION_ERROR", validationError });
    }
    return next();
  });
};
