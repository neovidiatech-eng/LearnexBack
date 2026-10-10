import * as teachersService from "./teachers.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const getAllTeachers = asyncHandler(async (req, res) => {
  const teachers = await teachersService.getAllTeachersService(req.query);
  return successResponse({ res, data: teachers });
});

export const getTeacherById = asyncHandler(async (req, res) => {
  const teachers = await teachersService.getTeacherByIdService(
    req.params.teacherId,
  );
  return successResponse({ res, data: teachers });
});

export const addTeacherReview = asyncHandler(async (req, res) => {
  const teachers = await teachersService.addTeacherReviewService(
    req.params.userId,
    req.params.teacherId,
    req.body,
  );
  return successResponse({ res, data: teachers });
});
