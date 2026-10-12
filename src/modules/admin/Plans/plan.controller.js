import * as planService from "./plan.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const getAllPlans = asyncHandler(async (req, res) => {
  const plans = await planService.getAllPlansService(req.query);
  return successResponse({
    res,
    data: plans,
  });
});

export const getPlanById = asyncHandler(async (req, res) => {
  const plans = await planService.getPlanByIdService(req.params.planId, req.query);
  return successResponse({
    res,
    data: plans,
  });
});

