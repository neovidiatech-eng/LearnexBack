import * as reportService from "./reports.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const getReports = asyncHandler(async (req, res) => {
  const locale = req.locale || req.headers?.["accept-language"]?.slice(0, 2) || "en";
  const result = await reportService.getReportsService(req.query, locale);
  return successResponse({
    res,
    data: result,
  });
});