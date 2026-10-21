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

export const getAllTickets = {
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
    assignedStaffId: generalFields.id.allow(null).optional(),
    search: joi.string().trim().max(100).optional(),
    sort: generalFields.sort,
  }),
};
export const getMyTickets = getAllTickets;

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

export const reopenTicket = {
  params: joi
    .object({
      ticketId: generalFields.id.required(),
    })
    .required(),
  body: joi
    .object({
      message: joi.string().optional(),
    })
    .optional(),
};

export const closeTicket = {
  params: joi
    .object({
      ticketId: generalFields.id.required(),
    })
    .required(),
};

export const getMessages = {
  params: joi
    .object({
      ticketId: generalFields.id.required(),
    })
    .required(),
  query: joi.object({
    id: generalFields.id.optional(),
    createdAt: generalFields.date.optional(),
    limit: generalFields.limit,
  }),
};

export const changeStatus = {
  params: joi
    .object({
      ticketId: generalFields.id.required(),
    })
    .required(),
  body: joi
    .object({
      status: joi
        .string()
        .valid(...Object.values(SupportTicketStatus))
        .required(),
    })
    .required(),
};



export const assignTicket = {
  params: joi
    .object({
      ticketId: generalFields.id.required(),
    })
    .required(),
  body: joi
    .object({
      staffId: generalFields.id.allow(null).required(),
    })
    .required(),
};
