import * as authService from "./auth.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginService({ ...req.body, ipAddress: req.ip });
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

export const logout = asyncHandler(async (req,res)=>{
  const result = await authService.logOutService({user:req.user,ipAddress:req.ip})
  return successResponse({
    res,
    message:"ADMIN_LOGGED_OUT_SUCCESSFULLY",
    data:result,
  })
})
