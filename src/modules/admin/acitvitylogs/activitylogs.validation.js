import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";

export const getActivityLogs = {
  query: joi.object({
    action: joi
      .string()
      .valid("all", "login", "logout")
      .default("all"),
    search: joi.string().optional(),
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10),
  }),
};

export const getActivityLogById = {
  params: joi.object({
    id: generalFields.id.messages({
      "any.required": "ACTIVITY_LOG_ID_REQUIRED",
      "string.empty": "ACTIVITY_LOG_ID_REQUIRED",
      "string.guid": "ACTIVITY_LOG_ID_INVALID",
    }),
  }),
};