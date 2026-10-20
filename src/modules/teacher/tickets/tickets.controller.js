import * as ticketService from "./tickets.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const getAllTickets = asyncHandler(async (req, res) => {
  const tickets = await ticketService.getAllTicketsService({
    user: req.user.id,
    query: req.query,
  });
  return successResponse({
    res,
    data: tickets,
  });
});

export const getTicketById = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const tickets = await ticketService.getTicketByIdService({
    user: req.user.id,
    ticketId,
  });
  return successResponse({
    res,
    data: tickets,
  });
});
export const createTicket = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = req.body;
  const file = req.file;
  const ticket = await ticketService.createTicketService({
    user: userId,
    body: data,
    file: file,
  });
  return successResponse({
    res,
    message: ticket ? "TICKET_CREATED" : "TICKET_NOT_CREATED",
  });
});
export const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = req.body;
  const file = req.file;
  const { ticketId } = req.params;
  const ticket = await ticketService.sendMessage({
    user: userId,
    body: data,
    file: file,
    ticketId
  });
  return successResponse({
    res,
    data:ticket,
  });
});
export const reopenTicket = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const data = req.body;
  const file = req.file;
  const { ticketId } = req.params;
  const ticket = await ticketService.reopenTicket({
    user: userId,
    body: data,
    file: file,
    ticketId
  });
  return successResponse({
    res,
    data:ticket,
  });
});
