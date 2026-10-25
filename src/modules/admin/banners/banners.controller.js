import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as bannersService from "./banners.service.js";

export const getAllBanners = asyncHandler(async (req, res) => {
  const result = await bannersService.getAllBannersService(req.query);
  return successResponse({
    res,
    data: result,
  });
});

export const getBannerById = asyncHandler(async (req, res) => {
  const result = await bannersService.getBannerByIdService(
    req.params.id,
    req.query.locale,
  );
  return successResponse({
    res,
    data: result,
  });
});

export const createBanner = asyncHandler(async (req, res) => {
  const result = await bannersService.createBannerService(req.body, req.file);
  return successResponse({
    res,
    status: 201,
    data: result,
  });
});

export const updateBanner = asyncHandler(async (req, res) => {
  const result = await bannersService.updateBannerService(
    req.params.id,
    req.body,
    req.file,
  );
  return successResponse({
    res,
    data: result,
  });
});

export const updateBannerStatus = asyncHandler(async (req, res) => {
  const result = await bannersService.updateBannerStatusService(
    req.params.id,
    req.body.isActive,
  );
  return successResponse({
    res,
    data: result,
  });
});

export const deleteBanner = asyncHandler(async (req, res) => {
   await bannersService.deleteBannerService(req.params.id);
  return successResponse({
    res,
   status:204
  });
});
