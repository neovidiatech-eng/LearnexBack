import * as profileService from "./profile.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";


export const getProfile = asyncHandler(async (req, res) => {
  const student = await profileService.getProfileService(req.user.id);
  return successResponse({
    res,
    data: student,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const student = await profileService.updateProfileService(req.user.id,req.body);
  return successResponse({
    res,
    data: student,
  });
});

export const changePassword = asyncHandler(async (req, res) => {
   await profileService.changePasswordService(
    req.user.id,
    req.body,
  );
  return successResponse({
    res,
    message:"PASSWORD_CHANGED_SUCCESSFULLY"
  });
});

export const updateImageProfile = asyncHandler(async (req, res) => {
  const student = await profileService.updateImageProfileService(
    req.user.id,
    req.files,
  );
  return successResponse({
    res,
    data: student,
  });
});

  
  export const deleteProfile = asyncHandler(async (req, res) => {
     await profileService.deleteProfileService(req.user.id);
    return successResponse({
      res,
      status:204
    });
  });