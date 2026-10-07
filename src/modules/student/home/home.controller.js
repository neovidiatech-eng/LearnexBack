import * as homeService from "./home.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

/**
 * GET /student/home
 * Returns aggregated home screen data for authenticated student.
 */
export const getStudentHomeData = asyncHandler(async (req, res) => {
  const data = await homeService.getStudentHomeDataService(req.user.id, {
    locale: req.query.locale || req.headers["accept-language"] || "ar",
  });

  return successResponse({
    res,
    message: "STUDENT_HOME_DATA_FETCHED_SUCCESSFULLY",
    data,
  });
});
