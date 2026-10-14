import * as requestService from "./requests.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const getRequestStats = asyncHandler(async (req, res) => {
  const requests = await requestService.getRequestStatsService(req.query);
  return successResponse({
    res,
    data: requests,
  });
});


export const getAllRequests = asyncHandler(async (req, res) => {
  const requests = await requestService.getAllRequestsService(req.query);
  return successResponse({
    res,
    data: requests,
  });
});

export const getRequestById = asyncHandler(async (req, res) => {
  const request = await requestService.getRequestByIdService(
    req.params.requestId,
  );
  return successResponse({
    res,
    data: request,
  });
});

export const approveRequest = asyncHandler(async (req, res) => {
  const request = await requestService.approveRequestService(req.params.requestId);
  return successResponse({
    res,
    data: request,
  });
});