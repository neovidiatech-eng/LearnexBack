import joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";
import {
  SupportTicketPriority,
  SupportTicketStatus,
} from "../../../utils/Enums/index.js";

const sendOrOpenSchema = {
  params: joi
    .object({
      ticketId: generalFields.id.required(),
    })
    .required(),
  body: joi
    .object({
      message: joi.string().required(),
    })
    .required(),
};

export const getMyTickets = {
  query: joi.object({
    page: generalFields.page,
    limit: generalFields.limit,
    status: joi
      .string()
      .valid(...Object.values(SupportTicketStatus))
      .optional(),
    priority: joi
      .string()
      .valid(...Object.values(SupportTicketPriority))
      .optional(),
    sort: generalFields.sort,
  }),
};
export const getTicketById = {
  params: joi
    .object({
      ticketId: generalFields.id.required(),
    })
    .required(),
};
export const createTicket = {
  body: joi.object({
    subject: joi.string().required(),
    priority: joi
      .string()
      .valid(...Object.values(SupportTicketPriority))
      .required(),
    message: joi.string().required(),
  }),
};
export const sendMessage = sendOrOpenSchema;
export const reopenTicket = sendOrOpenSchema;

export const getMessages = {
  params: joi
    .object({
      ticketId: generalFields.id.required(),
    })
    .required(),
  query: joi.object({
    id: generalFields.id.required(),
    createdAt: generalFields.date.required(),
    limit: generalFields.limit,
  }),
};
