import * as settingsService from "./settings.service.js";
import { asyncHandler, successResponse } from "../../utils/response.js";

export const changeLanguage = asyncHandler(async (req, res) => {
  const { language } = req.body;
  const userRole = req.decoded?.role || req.user?.role?.name || "student";

  const data = await settingsService.changeLanguageService(
    req.user.id,
    userRole,
    language,
  );

  return successResponse({
    res,
    statusCode: 200,
    message: "LANGUAGE_UPDATED_SUCCESSFULLY",
    data,
  });
});

export const getAppInfo = asyncHandler(async (req, res) => {
  const data = await settingsService.getAppInfoService();
  return successResponse({
    res,
    data,
  });
});

export const getPageBySlug = asyncHandler(async (req, res) => {
  const data = await settingsService.getPageBySlugService(req.params.slug);
  return successResponse({
    res,
    data,
  });
});

export const getAllPages = asyncHandler(async (req, res) => {
  const result = await settingsService.getAllPagesService(
    req.query,
  );
  return successResponse({ res, data: result });
});