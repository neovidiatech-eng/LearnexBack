import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as studentCourseService from "./courses.service.js";
export const toggleFavourite = asyncHandler(async (req, res) => {
  const result = await studentCourseService.toggleFavouriteService(
    req.user.id,
    req.params.courseId,
    req.body.isFavourite,
  );
  return successResponse({
    res,
    data: {
      result,
    },
  });
});

export const getFavorites = asyncHandler(async (req, res) => {
  const favoriteCourses = await studentCourseService.getAllFavoritesService(
    req.user.id,
    req.query,
  );
  return successResponse({ res, data: favoriteCourses });
});
