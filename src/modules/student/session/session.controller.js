import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as sessionService from "./session.service.js";

export const createRequestController = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const { startAt, note,title } = req.body;

  const result = await sessionService.createSessionRequest({
    userId: req.user.id,
    teacherId,
    startAt,
    note,
    title
  });

  return successResponse({
    res,
    status: 201,
    message: "SESSION_REQUEST_CREATED_SUCCESSFULLY",
    data: result,
  });
});

export const cancelRequestController = asyncHandler(async (req, res) => {
  const result = await sessionService.cancelSessionRequest({
    userId: req.user.id,
    requestId: req.params.requestId,
  });

  return successResponse({
    res,
    status: 200,
    message: "SESSION_REQUEST_CANCELLED_SUCCESSFULLY",
    data: result,
  });
});

export const createCustomRequestController = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const { sessionsCount, validityDays } = req.body;

  const result = await sessionService.createCustomSessionRequest({
    userId: req.user.id,
    teacherId,
    sessionsCount,
    validityDays,
  });

  return successResponse({
    res,
    status: 201,
    message: "CUSTOM_SESSION_REQUEST_CREATED_SUCCESSFULLY",
    data: result,
  });
});

export const getCustomRequestsController = asyncHandler(async (req, res) => {
  const result = await sessionService.getStudentCustomSessionRequests({
    userId: req.user.id,
    ...req.query,
  });

  return successResponse({
    res,
    status: 200,
    message: "CUSTOM_SESSION_REQUESTS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const cancelCustomRequestController = asyncHandler(async (req, res) => {
  const result = await sessionService.cancelCustomSessionRequest({
    userId: req.user.id,
    requestId: req.params.requestId,
  });

  return successResponse({
    res,
    status: 200,
    message: "CUSTOM_SESSION_REQUEST_CANCELLED_SUCCESSFULLY",
    data: result,
  });
});

export const joinSessionController = asyncHandler(async (req, res) => {
  const result = await sessionService.joinSession({
    userId: req.user.id,
    sessionId: req.params.sessionId,
  });

  return successResponse({
    res,
    status: 200,
    message: "SESSION_JOINED_SUCCESSFULLY",
    data: result,
  });
});

export const getMySessionsController = asyncHandler(async (req, res) => {
  const result = await sessionService.getStudentSessions({
    userId: req.user.id,
    ...req.query,
  });

  return successResponse({
    res,
    status: 200,
    message: "STUDENT_SESSIONS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const getSessionRequestsController = asyncHandler(async (req, res) => {
  const result = await sessionService.getStudentSessionRequests({
    userId: req.user.id,
    ...req.query,
  });

  return successResponse({
    res,
    status: 200,
    message: "SESSION_REQUESTS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});