import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as sessionService from "./session.service.js";

export const createRequestController = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const { startAt, note } = req.body;

  const result = await sessionService.createSessionRequest({
    userId: req.user.id,
    teacherId,
    startAt,
    note,
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