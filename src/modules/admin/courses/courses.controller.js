import * as coursesService from "./courses.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const createCourse = asyncHandler(async (req, res) => {
  const course = await coursesService.createCourseService(req.body);
  return successResponse({
    res,
    status: 201,
    message: "COURSE_CREATED_SUCCESSFULLY",
    data: { course },
  });
});

export const getAllCourses = asyncHandler(async (req, res) => {
  const result = await coursesService.getAllCoursesService(req.query);
  return successResponse({
    res,
    message: "COURSES_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const getCourseById = asyncHandler(async (req, res) => {
  const result = await coursesService.getCourseByIdService(req.params);
  return successResponse({
    res,
    message: "COURSE_DETAILS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const updateCourse = asyncHandler(async (req, res) => {
  const result = await coursesService.updateCourseService(req.body, req.params);
  return successResponse({
    res,
    message: "COURSE_UPDATED_SUCCESSFULLY",
    data: result,
  });
});

export const updateCourseStatus = asyncHandler(async (req, res) => {
  const result = await coursesService.updateCourseStatusService(
    req.body,
    req.params,
  );
  return successResponse({
    res,
    message: "COURSE_STATUS_UPDATED_SUCCESSFULLY",
    data: result,
  });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  await coursesService.deleteCourseService(req.params);
  return successResponse({
    res,
    status: 204,
  });
});

export const deleteSectionCourse = asyncHandler(async (req, res) => {
  await coursesService.deleteSectionService(req.params);
  return successResponse({
    res,
    status: 204,
  });
});

export const createSection = asyncHandler(async (req, res) => {
  const result = await coursesService.createSectionService(
    req.body,
    req.params,
  );
  return successResponse({
    res,
    status: 201,
    message: "SECTION_CREATED_SUCCESSFULLY",
    data: result,
  });
});

export const updateSection = asyncHandler(async (req, res) => {
  const result = await coursesService.updateSectionService(
    req.body,
    req.params,
  );
  return successResponse({
    res,
    message: "SECTION_UPDATED_SUCCESSFULLY",
    data: result,
  });
});



export const createLesson = asyncHandler(async (req, res) => {
  const result = await coursesService.createLessonService(
    req.body,
    req.params,
  );
  return successResponse({
    res,
    status: 201,
    message: "LESSON_CREATED_SUCCESSFULLY",
    data: result,
  });
});

export const updateLesson = asyncHandler(async (req, res) => {
  const result = await coursesService.updateLessonService(req.body, req.params);
  return successResponse({
    res,
    message: "LESSON_UPDATED_SUCCESSFULLY",
    data: result,
  });
});

export const deleteLesson = asyncHandler(async (req, res) => {
   await coursesService.deleteLessonService( req.params);
  return successResponse({
    res,
    status: 204,
  });
});