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
