import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";
import { reciverNotificationEnum } from "../../../utils/Enums/notifications.js";


const translation = joi.object({
  locale: joi.string().required(),
  title: joi.string().required(),
  message: joi.string().required(),
});


export const getAllNotifications = {
  query: joi.object({
    page: joi.number().integer().min(1).default(1),
    limit: joi.number().integer().min(1).max(100).default(10),
    isRead: joi.boolean().optional(),
    type: joi.string().optional(),
  }),
};

export const markAsRead = {
  params: joi.object({
    id: generalFields.id.required().messages({
      "any.required": "NOTIFICATION_ID_REQUIRED",
      "string.empty": "NOTIFICATION_ID_REQUIRED",
    }),
  }),
};

export const deleteNotification = {
  params: joi.object({
    id: generalFields.id.required().messages({
      "any.required": "NOTIFICATION_ID_REQUIRED",
      "string.empty": "NOTIFICATION_ID_REQUIRED",
    }),
  }),
};

export const createNotification = {
  body: joi.object({
    receiverId: joi.string().optional().default("GLOBAL"),
    receiverType: joi
      .string()
      .valid(...Object.values(reciverNotificationEnum))
      .default(reciverNotificationEnum.SYSTEM),
    type: joi.string().default("INFO"),
    priority: joi.string().valid("LOW", "MEDIUM", "HIGH").default("LOW"),
    link: joi.string().optional().allow("", null),
    translations: joi.array().items(translation).min(1).required(),
  }),
};

