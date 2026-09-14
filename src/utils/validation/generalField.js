import Joi from "joi";
import { VALID_TIMEZONE_VALUES } from "../date/timezones.js";


const globalPhonePattern = /^(?:\+[1-9]\d{5,14}|0?\d{5,14})$/;
const countryCallingCodePattern = /^\+[1-9]\d{0,3}$/;

export const generalFields = {
  role_name: Joi.string().min(3).max(15).messages({
    "string.base": "ROLE_NAME_STRING",
    "string.empty": "ROLE_NAME_EMPTY",
    "string.min": "ROLE_NAME_MIN",
    "string.max": "ROLE_NAME_MAX",
    "any.required": "ROLE_NAME_REQUIRED",
  }),
  timezone: Joi.string()
    .valid(...VALID_TIMEZONE_VALUES)
    .messages({
      "string.base": "TIMEZONE_STRING",
      "string.empty": "TIMEZONE_EMPTY",
      "any.only": "TIMEZONE_INVALID",
      "any.required": "TIMEZONE_REQUIRED",
    }),
  url: Joi.string().uri(),
  platform: Joi.string().valid("zoom", "google").messages({
    "string.base": "PLATFORM_STRING",
    "string.empty": "PLATFORM_EMPTY",
    "any.only": "PLATFORM_INVALID",
    "any.required": "PLATFORM_REQUIRED",
  }),
  permission_name: Joi.string().min(3).max(32).messages({
    "string.base": "PERMISSION_NAME_STRING",
    "string.empty": "PERMISSION_NAME_EMPTY",
    "string.min": "PERMISSION_NAME_MIN",
    "string.max": "PERMISSION_NAME_MAX",
    "any.required": "PERMISSION_NAME_REQUIRED",
  }),
  permission_code: Joi.string()
    .min(3)
    .max(32)
    .pattern(new RegExp("^[A-Z]+_[A-Z]+$"))
    .messages({
      "string.base": "PERMISSION_CODE_STRING",
      "string.empty": "PERMISSION_CODE_EMPTY",
      "string.pattern.base": "PERMISSION_CODE_PATTERN",
      "string.min": "PERMISSION_CODE_MIN",
      "string.max": "PERMISSION_CODE_MAX",
      "any.required": "PERMISSION_CODE_REQUIRED",
    }),
  name: Joi.string().min(3).max(32).messages({
    "string.base": "NAME_STRING",
    "string.empty": "NAME_EMPTY",
    "string.min": "NAME_MIN",
    "string.max": "NAME_MAX",
    "any.required": "MISSING_NAME",
  }),
  fullName: Joi.string().min(3).max(32).messages({
    "string.base": "FULL_NAME_STRING",
    "string.empty": "FULL_NAME_EMPTY",
    "string.min": "FULL_NAME_MIN",
    "string.max": "FULL_NAME_MAX",
    "any.required": "MISSING_FULL_NAME",
  }),
  email: Joi.string().email().messages({
    "string.base": "EMAIL_STRING",
    "string.empty": "EMAIL_EMPTY",
    "string.email": "EMAIL_INVALID",
    "any.required": "EMAIL_REQUIRED",
  }),
  number: Joi.number(),
  studentAge: Joi.number().integer().min(1).max(120).messages({
    "number.base": "AGE_NUMBER",
    "number.integer": "AGE_INTEGER",
    "number.min": "AGE_MIN",
    "number.max": "AGE_MAX",
    "any.required": "AGE_REQUIRED",
  }),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&^#])[A-Za-z\\d@$!%*?&^#]{8,}$",
      ),
    )
    .messages({
      "string.base": "PASSWORD_STRING",
      "string.empty": "PASSWORD_EMPTY",
      "string.pattern.base": "PASSWORD_PATTERN",
      "any.required": "PASSWORD_REQUIRED",
    }),
  confirmPassword: Joi.any().valid(Joi.ref("password")).messages({
    "any.only": "CONFIRM_PASSWORD_MISMATCH",
    "any.required": "CONFIRM_PASSWORD_REQUIRED",
  }),
  gender: Joi.string().valid("male", "female").messages({
    "string.base": "GENDER_STRING",
    "string.empty": "GENDER_EMPTY",
    "any.only": "GENDER_INVALID",
  }),
  birth_date: Joi.date().iso().messages({
    "date.base": "BIRTH_DATE_INVALID",
    "date.empty": "BIRTH_DATE_EMPTY",
    "date.format": "BIRTH_DATE_FORMAT",
    "any.required": "BIRTH_DATE_REQUIRED",
  }),
  date: Joi.date().iso(),
  country: Joi.string().messages({
    "string.base": "COUNTRY_STRING",
    "string.empty": "COUNTRY_EMPTY",
    "any.required": "COUNTRY_REQUIRED",
  }),
  phone: Joi.string()
    .trim()
    .pattern(globalPhonePattern)
    .messages({
      "string.base": "PHONE_STRING",
      "string.empty": "PHONE_EMPTY",
      "string.pattern.base": "VALID_PHONE",
      "any.required": "PHONE_REQUIRED",
    }),
  idToken: Joi.string().messages({
    "string.base": "ID_TOKEN_STRING",
    "string.empty": "ID_TOKEN_EMPTY",
    "any.required": "ID_TOKEN_REQUIRED",
  }),
  provider: Joi.string().valid("google", "local").messages({
    "string.base": "PROVIDER_STRING",
    "string.empty": "PROVIDER_EMPTY",
    "any.only": "PROVIDER_INVALID",
  }),
  otp: Joi.string()
    .max(6)
    .min(6)
    .regex(/^[0-9]{6}$/)
    .messages({
      "string.base": "OTP_STRING",
      "string.empty": "OTP_EMPTY",
      "string.min": "OTP_LENGTH",
      "string.max": "OTP_LENGTH",
      "string.pattern.base": "OTP_DIGITS_ONLY",
      "any.required": "OTP_REQUIRED",
    }),
  search: Joi.string().max(32).messages({
    "string.base": "SEARCH_STRING",
    "string.empty": "SEARCH_EMPTY",
    "string.max": "SEARCH_MAX",
    "any.required": "SEARCH_EMPTY",
  }),
  search_Currency: Joi.string().max(32).messages({
    "string.base": "SEARCH_STRING",
    "string.empty": "SEARCH_EMPTY",
    "string.max": "SEARCH_MAX",
    "any.required": "SEARCH_EMPTY",
  }),
  file: {
    fieldname: Joi.string().messages({
      "string.base": "FILE_FIELDNAME_STRING",
      "string.empty": "FILE_FIELDNAME_EMPTY",
      "any.required": "FILE_FIELDNAME_REQUIRED",
    }),
    originalname: Joi.string().messages({
      "string.base": "FILE_ORIGINALNAME_STRING",
      "string.empty": "FILE_ORIGINALNAME_EMPTY",
      "any.required": "FILE_ORIGINALNAME_REQUIRED",
    }),
    encoding: Joi.string().messages({
      "string.base": "FILE_ENCODING_STRING",
      "string.empty": "FILE_ENCODING_EMPTY",
      "any.required": "FILE_ENCODING_REQUIRED",
    }),
    mimetype: Joi.string().messages({
      "string.base": "FILE_MIMETYPE_STRING",
      "string.empty": "FILE_MIMETYPE_EMPTY",
      "any.required": "FILE_MIMETYPE_REQUIRED",
    }),
    finalPath: Joi.string().messages({
      "string.base": "FILE_FINALPATH_STRING",
      "string.empty": "FILE_FINALPATH_EMPTY",
      "any.required": "FILE_FINALPATH_REQUIRED",
    }),
    destination: Joi.string().messages({
      "string.base": "FILE_DESTINATION_STRING",
      "string.empty": "FILE_DESTINATION_EMPTY",
      "any.required": "FILE_DESTINATION_REQUIRED",
    }),
    filename: Joi.string().messages({
      "string.base": "FILE_FILENAME_STRING",
      "string.empty": "FILE_FILENAME_EMPTY",
      "any.required": "FILE_FILENAME_REQUIRED",
    }),
    path: Joi.string().messages({
      "string.base": "FILE_PATH_STRING",
      "string.empty": "FILE_PATH_EMPTY",
      "any.required": "FILE_PATH_REQUIRED",
    }),
    size: Joi.number().positive().messages({
      "number.base": "FILE_SIZE_NUMBER",
      "number.positive": "FILE_SIZE_POSITIVE",
      "any.required": "FILE_SIZE_REQUIRED",
    }),
    relativeDestination: Joi.string().optional(),
  },
  codeCountry: Joi.string()
    .trim()
    .pattern(countryCallingCodePattern)
    .messages({
      "string.base": "COUNTRY_CODE_STRING",
      "string.empty": "COUNTRY_CODE_EMPTY",
      "string.pattern.base": "VALID_COUNTRY_CALLING_CODE",
      "any.required": "COUNTRY_CODE_REQUIRED",
    }),
  name_en: Joi.string().messages({
    "string.base": "NAME_STRING",
    "string.empty": "NAME_EMPTY",
    "any.required": "MISSING_NAME",
  }),
  name_ar: Joi.string().messages({
    "string.base": "NAME_STRING",
    "string.empty": "NAME_EMPTY",
    "any.required": "MISSING_NAME",
  }),
  symbol: Joi.string().messages({
    "string.base": "SYMBOL_STRING",
    "string.empty": "SYMBOL_EMPTY",
    "any.required": "SYMBOL_REQUIRED",
  }),
  code: Joi.string().messages({
    "string.base": "CODE_STRING",
    "string.empty": "CODE_EMPTY",
    "any.required": "CODE_REQUIRED",
  }),
  exchangeRate: Joi.number().messages({
    "number.base": "EXCHANGE_RATE_NUMBER",
    "number.empty": "EXCHANGE_RATE_EMPTY",
    "any.required": "EXCHANGE_RATE_REQUIRED",
  }),
  default: Joi.boolean().messages({
    "boolean.base": "DEFAULT_BOOLEAN",
    "boolean.empty": "DEFAULT_EMPTY",
    "any.required": "DEFAULT_REQUIRED",
  }),

  description: Joi.string().min(10).max(1000).messages({
    "string.base": "DESCRIPTION_INVALID",
    "string.empty": "DESCRIPTION_INVALID",
    "any.required": "DESCRIPTION_REQUIRED",
  }),
  price: Joi.number().positive().messages({
    "number.base": "PRICE_NUMBER",
    "number.positive": "PRICE_POSITIVE",
    "any.required": "PRICE_REQUIRED",
  }),
  duration: Joi.number().positive().messages({
    "number.base": "DURATION_NUMBER",
    "number.positive": "DURATION_POSITIVE",
    "any.required": "DURATION_REQUIRED",
  }),
  sessionsCount: Joi.number().positive().messages({
    "number.base": "SESSIONS_COUNT_NUMBER",
    "number.positive": "SESSIONS_COUNT_POSITIVE",
    "any.required": "SESSIONS_COUNT_REQUIRED",
  }),
  sessionTime: Joi.number().positive().messages({
    "number.base": "SESSION_TIME_NUMBER",
    "number.positive": "SESSION_TIME_POSITIVE",
    "any.required": "SESSION_TIME_REQUIRED",
  }),
  active: Joi.boolean().messages({
    "boolean.base": "ACTIVE_BOOLEAN",
    "boolean.empty": "ACTIVE_EMPTY",
    "any.required": "ACTIVE_REQUIRED",
  }),
  bestSeller: Joi.boolean().messages({
    "boolean.base": "BEST_SELLER_BOOLEAN",
    "boolean.empty": "BEST_SELLER_EMPTY",
    "any.required": "BEST_SELLER_REQUIRED",
  }),
  type: Joi.string().valid("full", "half").messages({
    "string.base": "TYPE_STRING",
    "string.empty": "TYPE_EMPTY",
    "any.required": "TYPE_REQUIRED",
    "any.only": "TYPE_INVALID",
  }),
  features: Joi.object().messages({
    "object.base": "FEATURES_OBJECT",
    "object.empty": "FEATURES_EMPTY",
    "any.required": "FEATURES_REQUIRED",
  }),
  id: Joi.string().uuid(),
  parent_recurring_id: Joi.string()
    .pattern(/^rec_.{10}$/)

    .messages({
      "string.empty": "PARENT_RECURRING_ID_REQUIRED",
      "any.required": "PARENT_RECURRING_ID_REQUIRED",
      "string.pattern.base": "PARENT_RECURRING_ID_INVALID",
    }),
  color: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .messages({
      "string.base": "COLOR_STRING",
      "string.empty": "COLOR_EMPTY",
      "string.pattern.base": "COLOR_INVALID",
      "any.required": "COLOR_REQUIRED",
    }),
  page: Joi.number().integer().min(1).messages({
    "number.base": "PAGE_NUMBER",
    "number.integer": "PAGE_INTEGER",
    "number.min": "PAGE_MIN",
    "any.required": "PAGE_REQUIRED",
  }),
  limit: Joi.number().integer().min(1).messages({
    "number.base": "LIMIT_NUMBER",
    "number.integer": "LIMIT_INTEGER",
    "number.min": "LIMIT_MIN",
    "number.max": "LIMIT_MAX",
    "any.required": "LIMIT_REQUIRED",
  }),
  sort: Joi.string().messages({
    "string.base": "SORT_STRING",
    "string.empty": "SORT_EMPTY",
    "any.required": "SORT_REQUIRED",
  }),
  sortType: Joi.string().valid("asc", "desc").messages({
    "string.base": "SORT_TYPE_STRING",
    "string.empty": "SORT_TYPE_EMPTY",
    "any.only": "SORT_TYPE_INVALID",
    "any.required": "SORT_TYPE_REQUIRED",
  }),
  rescheduleCount: Joi.number().positive().messages({
    "number.base": "RESCHEDULE_COUNT_NUMBER",
    "number.positive": "RESCHEDULE_COUNT_POSITIVE",
  }),
};
