import * as settingService from "./settings.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const updateAppInfo = asyncHandler(async (req, res) => {
  const result = await settingService.updateAppInfoService(
    req.body,
    req.file,
    req.query.locale || "ar",
  );
  return successResponse({ res, data: result });
});

export const updatePages = asyncHandler(async (req, res) => {
  const result = await settingService.updatePagesService(
    req.body,
    req.params.slug,
    req.query.locale || "ar",
  );
  return successResponse({ res, data: result });
});


export const getAllPages = asyncHandler(async (req, res) => {
  const result = await settingService.getAllPagesService(
    req.query,
  );
  return successResponse({ res, data: result });
});

