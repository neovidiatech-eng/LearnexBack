import * as authService from "./auth.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const signup = asyncHandler(async (req, res) => {
  const result = await authService.teacherSignupService(req.body, req.file);
  return successResponse({
    res,
    status: 201,
    message: "TEACHER_APPLICATION_SUBMITTED_SUCCESSFULLY",
    data: { teacher: result },
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.teacherLoginService(req.body);
  return successResponse({
    res,
    status: 200,
    message: "LOGIN_SUCCESSFUL",
    data: result,
  });
});

export const getNewCredentials = asyncHandler(async (req, res) => {
  const result = await authService.getNewCredentialsService(req.user);
  return successResponse({
    res,
    status: 200,
    message: "TOKEN_REFRESHED_SUCCESSFULLY",
    data: result,
  });
});
