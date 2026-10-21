import Joi from "joi";
import { requestStatus } from "../../../utils/Enums/session-request.enum.js";
import { sessionStatus } from "../../../utils/Enums/sessions.enum.js";

export const getMySessions = {
  query: Joi.object({
    status: Joi.string()
      .valid(...Object.values(sessionStatus))
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
  }),
};

export const getSessionRequests = {
  query: Joi.object({
    status: Joi.string()
      .valid(...Object.values(requestStatus))
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
  }),
};

export const createRequest = {
  params: Joi.object({
    teacherId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    startAt: Joi.date().iso().required(),
    title: Joi.string().trim().min(3).max(150).optional(),
    note: Joi.string().trim().max(500).allow("", null).optional(),
  }).options({ allowUnknown: false }),
};

export const cancelRequest = {
  params: Joi.object({
    requestId: Joi.string().uuid().required(),
  }),
};

export const createCustomRequest = {
  params: Joi.object({
    teacherId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    sessionsCount: Joi.number().integer().min(1).max(100).required(),
    validityDays: Joi.number().integer().min(1).max(365).optional().default(30),
  }).options({ allowUnknown: false }),
};

export const cancelCustomRequest = {
  params: Joi.object({
    requestId: Joi.string().uuid().required(),
  }),
};

export const getCustomRequests = {
  query: Joi.object({
    status: Joi.string()
      .valid("PENDING", "ACCEPTED", "REJECTED", "CANCELLED")
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
  }),
};

export const joinSession = {
  params: Joi.object({
    sessionId: Joi.string().uuid().required(),
  }),
};


