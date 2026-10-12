import * as teachersService from "./teachers.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const getAllTeachers = asyncHandler(async (req, res) => {
  const teachers = await teachersService.getAllTeachersService(req.query);
  return successResponse({ res, data: teachers });
});

export const getTeacherById = asyncHandler(async (req, res) => {
  const lang = req.headers["accept-language"];
  const teacherId = req.params.id || req.params.teacherId;
  const teachers = await teachersService.getTeacherByIdService({
    teacherId,
    lang,
  });
  return successResponse({ res, data: teachers });
});

export const bookPlan = asyncHandler(async (req, res) => {
  const planId = req.params.id || req.params.planId;
  const { paymentMethod, sessionsCount, customSessionCount } = req.body || {};

  const booking = await teachersService.bookPlanService({
    planId,
    userId: req.user.id,
    paymentMethod,
    sessionsCount,
    customSessionCount,
  });

  return successResponse({
    res,
    message: "PLAN_BOOKING_INITIATED",
    status: 201,
    data: booking,
  });
});
