import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";

const translationSchema = joi.object({
  lang: joi.string().valid("en", "ar", "fr").default("en"),
  title: generalFields.name.required(),
  description: generalFields.description.required(),
  slug: joi.string().trim().optional(),
});

export const getMyPlans = {
  query: joi.object({
    page: generalFields.page.required(),
    limit: generalFields.limit.required(),
    search: generalFields.search.optional(),
    sortOrder: joi.string().optional().valid("asc", "desc").optional(),
    lang: joi.string().valid("en", "ar", "fr").optional(),
  }),
};

export const getPlanById = {
  params: joi.object({
    planId: generalFields.id.required(),
  }),
  query: joi.object({
    lang: joi.string().valid("en", "ar", "fr").optional(),
  }),
};

export const createPlan = {
  body: joi
    .object({
      color: generalFields.color.optional(),
      sessionsCount: generalFields.sessionsCount.required(),
      price: generalFields.price.required(),
      discountType: joi.string().valid("PERCENTAGE", "FIXED").allow(null),
      discountValue: joi
        .number()
        .precision(2)
        .positive()
        .allow(null)
        .when("discountType", {
          is: "PERCENTAGE",
          then: joi.number().max(100),
        }),
      isActive: joi.boolean().default(true),
      translations: joi.array().items(translationSchema).min(1).required(),
      slug: joi.string().trim().optional(),
    })
    .required()
    .and("discountType", "discountValue"),
};

export const deletePlan = {
  params: joi.object({
    planId: generalFields.id.required(),
  }),
};

export const updatePlan = {
  params: joi.object({
    planId: generalFields.id.required(),
  }),
  body: joi
    .object({
      color: generalFields.color.optional(),
      sessionsCount: generalFields.sessionsCount.optional(),
      price: generalFields.price.optional(),
      discountType: joi.string().valid("PERCENTAGE", "FIXED").allow(null).optional(),
      discountValue: joi
        .number()
        .precision(2)
        .positive()
        .allow(null)
        .when("discountType", {
          is: "PERCENTAGE",
          then: joi.number().max(100),
        })
        .optional(),
      isActive: joi.boolean().optional(),
      translations: joi.array().items(translationSchema).optional(),
      slug: joi.string().trim().optional(),
    })
    .min(1)
    .and("discountType", "discountValue"),
};