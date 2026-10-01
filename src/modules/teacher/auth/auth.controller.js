import * as authService from "./auth.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const signup = asyncHandler(async (req, res) => {
  const result = await authService.teacherSignupService(req.body, req.files);
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

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPasswordService(req.body);
  return successResponse({
    res,
    status: 200,
    message: "OTP_SENT_SUCCESSFULLY",
    data: result,
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPasswordService(req.body);
  return successResponse({
    res,
    status: 200,
    message: "PASSWORD_RESET_SUCCESSFULLY",
    data: result,
  });
});
