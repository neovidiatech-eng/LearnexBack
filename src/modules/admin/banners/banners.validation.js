import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";
import { actionTypeEnum } from "../../../utils/Enums/banner.enum.js";
import { jsonArray } from "../../../utils/validation/jsonField.js";

const translationSchema = joi.object({
  locale: joi.string().trim().min(2).max(10).required(),
  title: joi.string().trim().required(),
  subtitle: joi.string().trim().required(),
  buttonText: joi.string().trim().required(),
});

const idParams = joi.object({
  id: generalFields.id.required(),
});

export const getAllBanners = {
  query: joi.object({
    locale: joi.string().trim().min(2).max(10).default("en"),
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10),
    search: joi.string().trim().allow("").optional(),
    isActive: joi.boolean().optional(),
  }),
};

export const getBannerById = { params: idParams };

export const createBanner = {
  body: joi.object({
    actionType: joi
      .string()
      .valid(...Object.values(actionTypeEnum))
      .default("DISCOUNT"),
    targetId: joi.string().uuid().allow(null, "").optional(),
    isActive: joi.boolean().default(true),
    order: joi.number().integer().min(1).default(1),
    translations: jsonArray(translationSchema, { required: true }),
  }),
};

export const updateBanner = {
  params: idParams,
  body: joi.object({
    actionType: joi.string().valid(...Object.values(actionTypeEnum)),
    targetId: joi.string().uuid().allow(null, ""),
    isActive: joi.boolean(),
    order: joi.number().integer().min(1),
    translations: jsonArray(translationSchema),
  }),
};

export const updateBannerStatus = {
  params: idParams,
  body: joi.object({ isActive: joi.boolean().required() }),
};

export const deleteBanner = { params: idParams };
