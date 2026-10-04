import * as profileService from "./profile.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const toggleVisibility = asyncHandler(async (req, res) => {
  const teacher = await profileService.toggleVisibilityService(
    req.user.id,
    req.body?.isAvailable,
  );
  return successResponse({
    res,
    data: teacher,
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const teacher = await profileService.getProfileService(req.user.id);
  return successResponse({
    res,
    data: teacher,
  });
});

export const shareProfile = asyncHandler(async (req, res) => {
  const teacher = await profileService.getSharedProfileService(
    req.params.teacherId,
  );
  return successResponse({
    res,
    data: teacher,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const teacher = await profileService.updateProfileService(req.user.id,req.body);
  return successResponse({
    res,
    data: teacher,
  });
});
export const updateSessionPrice = asyncHandler(async (req, res) => {
  const teacher = await profileService.updateSessionPriceService(
    req.user.id,
    req.body,
  );
  return successResponse({
    res,
    data: teacher,
  });
});

export const updateImageProfile = asyncHandler(async (req, res) => {
  const teacher = await profileService.updateImageProfileService(
    req.user.id,
    req.files,
  );
  return successResponse({
    res,
    data: teacher,
  });
});

  
  export const deleteProfile = asyncHandler(async (req, res) => {
     await profileService.deleteProfileService(req.user.id);
    return successResponse({
      res,
      status:204
    });
  });