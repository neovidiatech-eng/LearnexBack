import Joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";

const discountType = Joi.string().valid("AMOUNT", "PERCENTAGE").messages({
  "any.only": "DISCOUNT_TYPE_INVALID",
  "any.required": "DISCOUNT_TYPE_REQUIRED",
});

const discountValue = Joi.number()
  .positive()
  .when("discountType", {
    is: "PERCENTAGE",
    then: Joi.number().max(100).messages({ "number.max": "DISCOUNT_VALUE_PERCENTAGE_MAX" }),
  })
  .messages({
    "number.base": "DISCOUNT_VALUE_NUMBER",
    "number.positive": "DISCOUNT_VALUE_POSITIVE",
    "any.required": "DISCOUNT_VALUE_REQUIRED",
  });

const usageLimit = Joi.number().integer().positive().messages({
  "number.base": "USAGE_LIMIT_NUMBER",
  "number.integer": "USAGE_LIMIT_INTEGER",
  "number.positive": "USAGE_LIMIT_POSITIVE",
  "any.required": "USAGE_LIMIT_REQUIRED",
});

const maxUsesPerUser = Joi.number().integer().positive().messages({
  "number.base": "MAX_USES_PER_USER_NUMBER",
  "number.integer": "MAX_USES_PER_USER_INTEGER",
  "number.positive": "MAX_USES_PER_USER_POSITIVE",
});

const couponBody = {
  name: generalFields.name.required(),
  code: generalFields.code.uppercase().required(),
  discountType: discountType.required(),
  discountValue: discountValue.required(),
  startDate: generalFields.date.required(),
  expirationDate: generalFields.date
    .greater(Joi.ref("startDate"))
    .required()
    .messages({ "date.greater": "EXPIRATION_DATE_AFTER_START" }),
  usageLimit: usageLimit.required(),
  maxUsesPerUser: maxUsesPerUser.default(1),
};

export const createCoupon = { body: Joi.object(couponBody) };

export const updateCoupon = {
  params: Joi.object({
    id: generalFields.id.required().messages({
      "any.required": "COUPON_ID_REQUIRED",
      "string.guid": "COUPON_ID_INVALID",
    }),
  }),
  body: Joi.object(couponBody).fork(Object.keys(couponBody), (s) => s.optional()),
};

export const getCoupons = {
  query: Joi.object({
    search: generalFields.search.optional(),
    status: Joi.string().valid("all", "active", "expired", "scheduled", "exhausted","deactivated").default("all"),
    page: generalFields.page.default(1),
    limit: generalFields.limit.default(10),
  }),
};

export const getCouponById = {
  params: Joi.object({
    id: generalFields.id.required().messages({
      "any.required": "COUPON_ID_REQUIRED",
      "string.guid": "COUPON_ID_INVALID",
    }),
  }),
};

export const deleteCoupon = getCouponById;