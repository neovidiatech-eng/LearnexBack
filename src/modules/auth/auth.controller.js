import * as authService from "./auth.service.js";
import { asyncHandler, successResponse } from "../../utils/response.js";

import { ROLES } from "../../utils/Permissions/permissions.js";

export const signup = asyncHandler(async (req, res) => {
  const result = await authService.signupService({
    ...req.body,
    roleName: ROLES.STUDENT, 
  });
  return successResponse({
    res,
    status: 201,
    message: "STUDENT_REGISTERED_SUCCESSFULLY",
    data: { user: result },
  });
});

export const teacherSignup = asyncHandler(async (req, res) => {
  const result = await authService.signupService({
    ...req.body,
    roleName: ROLES.TEACHER, 
  });
  return successResponse({
    res,
    status: 201,
    message: "TEACHER_REGISTERED_SUCCESSFULLY",
    data: { user: result },
  });
});


export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginService(req.body);
  return successResponse({
    res,
    status: 200,
    message: "LOGIN_SUCCESSFUL",
    data: result,
  });
})

export const confirmEmail = asyncHandler(async (req, res) => {
  const result = await authService.confirmEmailService(req.body);
  return successResponse({
    res,
    status: 200,
    message: "EMAIL_CONFIRMED_SUCCESSFULLY",
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
