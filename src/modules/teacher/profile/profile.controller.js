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

export const updateProfile = asyncHandler(async (req, res) => {
  const teacher = await profileService.updateProfileService(req.user.id,req.body);
  return successResponse({
    res,
    data: teacher,
  });
});

export const updateCoverImage = asyncHandler(async (req, res) => {
  const teacher = await profileService.updateCoverImageService(
    req.user.id,
    req.file,
  );
  return successResponse({
    res,
    data: teacher,
  });
});

export const updateProfileImage = asyncHandler(async (req, res) => {
  const teacher = await profileService.updateProfileImageService(
    req.user.id,
    req.file,
  );
  return successResponse({
    res,
    data: teacher,
  });
});
