
import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as bannersService from "./banners.service.js";

export const getAllBanners = asyncHandler(async (req, res) => {
  const result = await bannersService.getAllBannersService(req.query);

  return successResponse({
    res,
    message: "BANNERS_FETCHED_SUCCESSFULLY",
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
    message: "BANNER_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const createBanner = asyncHandler(async (req, res) => {
  const result = await bannersService.createBannerService(req.body, req.file);

  return successResponse({
    res,
    status: 201,
    message: "BANNER_CREATED_SUCCESSFULLY",
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
    message: "BANNER_UPDATED_SUCCESSFULLY",
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
    message: "BANNER_STATUS_UPDATED_SUCCESSFULLY",
    data: result,
  });
});

export const deleteBanner = asyncHandler(async (req, res) => {
  await bannersService.deleteBannerService(req.params.id);

  return successResponse({
    res,
    message: "BANNER_DELETED_SUCCESSFULLY",
    status: 204,
  });
});

export const reOrderBanner = asyncHandler(async (req, res) => {
  const bannerId = req.params.id;
  const { order } = req.body;

  await bannersService.reOrderBannerService(bannerId, order);

  return successResponse({
    res,
    message: "BANNER_REORDERED_SUCCESSFULLY",
    status: 200,
  });
});
