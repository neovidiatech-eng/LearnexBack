import * as stateService from "./states.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const getStates = asyncHandler(async (req, res) => {
  const locale = req.locale || req.headers?.["accept-language"]?.slice(0, 2) || "en";
  const result = await stateService.getStatesService(req.query, locale);
  return successResponse({
    res,
    message: "DASHBOARD_STATS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});