
import Joi from "joi";
import { requestStatus } from "../../../utils/Enums/session-request.enum.js";
import { sessionStatus } from "../../../utils/Enums/sessions.enum.js";


export const getSessionRequests = {
  query: Joi.object({
    status: Joi.string()
      .valid(...Object.values(requestStatus))
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
  }),
};

export const acceptRequest = {
  params: Joi.object({
    requestId: Joi.string().uuid().required(),
  }),
};

export const rejectRequest = {
  params: Joi.object({
    requestId: Joi.string().uuid().required(),
  }),
  body: Joi.object({
    rejectedReason: Joi.string().trim().max(500).allow("").optional(),
  }),
};


export const getMySessions = {
  query: Joi.object({
    status: Joi.string()
      .valid(...Object.values(sessionStatus))
      .optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(20),
  }),
};
export const startSession = {
  params: Joi.object({
    sessionId: Joi.string().uuid().required(),
  }),
};

export const endSessionValidation = {
  params: Joi.object({
    sessionId: Joi.string().uuid().required(),
  }),
};
export const joinSession = {
  params: Joi.object({
    sessionId: Joi.string().uuid().required(),
  }),
};