import Joi from "joi";

export const getConversations = {
  query: Joi.object({
    search: Joi.string().trim().max(100).allow("", null).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

export const getMessages = {
  params: Joi.object({
    conversationId: Joi.string().uuid().required(),
  }),
  query: Joi.object({
    cursor: Joi.string().uuid().optional(),
    limit: Joi.number().integer().min(1).max(100).default(30),
  }),
};

export const startConversation = {
  body: Joi.object({
    teacherId: Joi.string().uuid(),
    studentId: Joi.string().uuid(),
  }).xor("teacherId", "studentId"),
};

export const markAsRead = {
  params: Joi.object({
    conversationId: Joi.string().uuid().required(),
  }),
};