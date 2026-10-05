import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as studentCourseService from "./courses.service.js";

export const toggleFavourite = asyncHandler(async (req, res) => {
  const result = await studentCourseService.toggleFavouriteService(
    req.user.id,
    req.params.courseId,
    req.body?.itemType || "COURSE",
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

export const enrollFreeCourse = asyncHandler(async (req, res) => {
  const enrollment = await studentCourseService.enrollFreeCourseService(
    req.user.id,
    req.params.courseId
  );
  return successResponse({
    res,
    status: 201,
    message: "ENROLLMENT_SUCCESSFUL",
    data: enrollment,
  });
});

export const getEnrolledCourses = asyncHandler(async (req, res) => {
  const result = await studentCourseService.getEnrolledCoursesService(
    req.user.id,
    req.query
  );
  return successResponse({ res, data: result });
});
