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

export const getCourseCatalog = asyncHandler(async (req, res) => {
  const result = await studentCourseService.getCourseCatalogService(
    req.user.id,
    req.query
  );
  return successResponse({ res, data: result });
});

export const getCategories = asyncHandler(async (req, res) => {
  const result = await studentCourseService.getCategoriesService(
    req.user.id,
    req.query
  );
  return successResponse({ res, data: result });
});

export const getCourseDetails = asyncHandler(async (req, res) => {
  const result = await studentCourseService.getCourseDetailsService(
    req.user.id,
    req.params.courseId,
    req.query
  );
  return successResponse({ res, data: result });
});

export const completeLesson = asyncHandler(async (req, res) => {
  const result = await studentCourseService.completeLessonService(
    req.user.id,
    req.params.courseId,
    req.params.lessonId
  );
  return successResponse({
    res,
    message: "LESSON_COMPLETED_SUCCESSFULLY",
    data: result,
  });
});

export const addCourseReview = asyncHandler(async (req, res) => {
  const result = await studentCourseService.addCourseReviewService(
    req.user.id,
    req.params.courseId,
    req.body
  );
  return successResponse({
    res,
    status: 201,
    message: "REVIEW_SUBMITTED_SUCCESSFULLY",
    data: result,
  });
});

export const getCourseReviews = asyncHandler(async (req, res) => {
  const result = await studentCourseService.getCourseReviewsService(
    req.user.id,
    req.params.courseId,
    req.query
  );
  return successResponse({ res, data: result });
});

export const deleteCourseReview = asyncHandler(async (req, res) => {
  const result = await studentCourseService.deleteCourseReviewService(
    req.user.id,
    req.params.courseId
  );
  return successResponse({ res, data: result });
});
