import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";

export const bookPlanSchema = {
  params: joi
    .object({
      id: generalFields.id.required(),
    })
    .required(),
  body: joi
    .object({
      paymentMethod: joi
        .string()
        .trim()
        .valid("CARD")
        .optional()
        .default("CARD")
    })
    .optional(),
};

export const bookPlanSchmea = bookPlanSchema;
