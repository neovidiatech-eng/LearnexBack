import * as sessionService from "./session.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const getSessions = asyncHandler(async (req, res) => {
  const result = await sessionService.getSessionsService(req.query);
  return successResponse({
    res,
    data: result,
  });
});

export const getSessionById = asyncHandler(async (req, res) => {
  const session = await sessionService.getSessionByIdService(req.params.sessionId);
  return successResponse({
    res,
    data: session,
  });
});
