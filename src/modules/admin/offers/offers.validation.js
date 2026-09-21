import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";
import { offerStatusEnum, offerTypeEnum } from "../../../utils/Enums/index.js";

const translationSchema = joi.object({
  locale: joi.string().valid("en", "ar", "fr").required().messages({
    "any.only": "INVALID_LOCALE",
    "any.required": "LOCALE_REQUIRED",
  }),
  name: joi.string().min(3).max(150).trim().required().messages({
    "string.empty": "OFFER_NAME_REQUIRED",
    "string.min": "OFFER_NAME_MIN",
    "string.max": "OFFER_NAME_MAX",
  }),
  offerDesc: joi.string().min(5).max(2000).trim().required().messages({
    "string.empty": "OFFER_DESC_REQUIRED",
    "string.min": "OFFER_DESC_MIN",
  }),
});

export const createOffer = {
  body: joi
    .object({
      target: joi.string().min(2).max(100).trim().default("All Users"),
      offerType: joi
        .string()
        .valid(...Object.values(offerTypeEnum))
        .default(offerTypeEnum.PERCENTAGE),
      discount: joi.number().min(0).allow(null).optional(),
      startDate: joi.date().iso().required().messages({
        "any.required": "START_DATE_REQUIRED",
      }),
      endDate: joi.date().iso().min(joi.ref("startDate")).required().messages({
        "date.min": "END_DATE_MUST_BE_AFTER_START_DATE",
        "any.required": "END_DATE_REQUIRED",
      }),
      status: joi
        .string()
        .valid(...Object.values(offerStatusEnum))
        .default(offerStatusEnum.ACTIVE),
      translations: joi
        .array()
        .items(translationSchema)
        .min(1)
        .required()
        .messages({
          "array.min": "AT_LEAST_ONE_TRANSLATION_REQUIRED",
          "any.required": "TRANSLATIONS_REQUIRED",
        }),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const getOfferById = {
  params: joi
    .object({
      offerId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
  query: joi
    .object({
      locale: joi.string().valid("en", "ar", "fr").optional(),
    })
    .options({ allowUnknown: false }),
};

export const getAllOffers = {
  query: joi
    .object({
      page: generalFields.page.default(1),
      limit: generalFields.limit.default(10),
      search: joi.string().trim().allow("").optional(),
      locale: joi.string().valid("en", "ar", "fr").optional(),
      status: joi
        .string()
        .valid(...Object.values(offerStatusEnum))
        .optional(),
      offerType: joi
        .string()
        .valid(...Object.values(offerTypeEnum))
        .optional(),
      target: joi.string().trim().allow("").optional(),
      sort: joi
        .string()
        .valid("createdAt", "startDate", "endDate")
        .default("createdAt")
        .optional(),
      sortType: generalFields.sortType.default("desc").optional(),
    })
    .options({ allowUnknown: false }),
};

export const updateOffer = {
  params: joi
    .object({
      offerId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
  body: joi
    .object({
      target: joi.string().min(2).max(100).trim().optional(),
      offerType: joi
        .string()
        .valid(...Object.values(offerTypeEnum))
        .optional(),
      discount: joi.number().min(0).allow(null).optional(),
      startDate: joi.date().iso().optional(),
      endDate: joi.date().iso().optional(),
      status: joi
        .string()
        .valid(...Object.values(offerStatusEnum))
        .optional(),
      translations: joi.array().items(translationSchema).optional(),
    })
    .min(1)
    .required()
    .options({ allowUnknown: false }),
};

export const changeOfferStatus = {
  params: joi
    .object({
      offerId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
  body: joi
    .object({
      status: joi
        .string()
        .valid(...Object.values(offerStatusEnum))
        .required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const deleteOffer = {
  params: joi
    .object({
      offerId: generalFields.id.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};
