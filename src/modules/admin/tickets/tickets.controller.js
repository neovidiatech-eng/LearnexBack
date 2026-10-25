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
  const ticket = await ticketService.getTicketByIdService({
    ticketId,
  });
  return successResponse({
    res,
    data: ticket,
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.user
  const data = req.body;
  const file = req.file;
  const { ticketId } = req.params;
  const ticket = await ticketService.sendMessage({
    user: userId,
    body: data,
    file: file,
    ticketId,
  });
  return successResponse({
    res,
    data: ticket,
  });
});

export const closeTicket = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { ticketId } = req.params;
  const ticket = await ticketService.closeTicketService({
    user: userId,
    ticketId,
  });
  return successResponse({
    res,
    data: ticket,
  });
});


export const changeStatus = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { status } = req.body;
  const ticket = await ticketService.changeStatusService({
    ticketId,
    status,
  });
  return successResponse({
    res,
    data: ticket,
  });
});



export const assignTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { staffId } = req.body;
  const ticket = await ticketService.assignTicketService({
    ticketId,
    staffId,
  });
  return successResponse({
    res,
    data: ticket,
  });
});

export const getMessages = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { id, createdAt, limit } = req.query;
  const result = await ticketService.getMessagesService({
    id,
    createdAt,
    limit,
    ticketId,
  });
  return successResponse({
    res,
    data: result,
  });
});
