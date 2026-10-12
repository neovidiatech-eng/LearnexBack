import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as planService from "./plan.service.js";

export const getMyPlansController = asyncHandler(async (req, res) => {
  const plans = await planService.getMyPlansService({
    userId: req.user.id,
    query: req.query,
  });
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

export const createPlan = asyncHandler(async (req, res) => {
  const plans = await planService.createPlanService({
    body: req.body,
    userId: req.user.id,
  });
  return successResponse({
    message: req.i18n.t("PLAN_CREATED_SUCCESSFULLY"),
    res,
    data: plans,
  });
});

export const deletePlan = asyncHandler(async (req, res) => {
  const plans = await planService.deletePlanService({
    userId: req.user.id,
    planId: req.params.planId,
  });
  return successResponse({
    res,
    data: plans,
  });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const plan = await planService.updatePlanService({
    userId: req.user.id,
    planId: req.params.planId,
    body: req.body,
  });
  return successResponse({
    message: req.i18n.t("PLAN_UPDATED_SUCCESSFULLY"),
    res,
    data: plan,
  });
});

