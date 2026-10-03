import * as settingsService from "./settings.service.js";
import { asyncHandler, successResponse } from "../../utils/response.js";

export const changeLanguage = asyncHandler(async (req, res) => {
  const rawRole =
    req.user?.role?.slug ||
    (typeof req.decoded?.role === "string" ? req.decoded?.role : null) ||
    req.user?.role?.name ||
    "student";
  const userRole = String(rawRole || "student");

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