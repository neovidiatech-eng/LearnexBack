import * as authService from "./auth.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginService(req.body);
  return successResponse({
    res,
    message: "ADMIN_LOGIN_SUCCESSFUL",
    data: result,
  });
});

export const getNewCredentials = asyncHandler(async (req, res) => {
  const result = await authService.getNewCredentialsService(req.user);
  return successResponse({
    res,
    message: "ADMIN_TOKEN_REFRESHED_SUCCESSFULLY",
    data: result,
  });
});
