import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as teacherService from "./teacher.service.js";

export const createTeacher = asyncHandler(async (req, res, next) => {
  const result = await teacherService.createTeacherService(req.body);
  return successResponse({
    res,
    status: 201,
    message: "TEACHER_CREATED_SUCCESSFULLY",
    data: result,
  });
});

export const getAllTeacher = asyncHandler(async (req, res, next) => {
  const result = await teacherService.getAllTeachersService(req.query);
  return successResponse({
    res,
    message: "TEACHERS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const getTeacherById = asyncHandler(async (req, res, next) => {
  const teacher = await teacherService.getTeacherByIdService(
    req.params.teacherId
  );
  return successResponse({
    res,
    message: "TEACHER_DETAILS_FETCHED_SUCCESSFULLY",
    data: teacher,
  });
});

export const updateTeacher = asyncHandler(async (req, res, next) => {
  const teacher = await teacherService.updateTeacherService(
    req.body,
    req.params.teacherId
  );
  return successResponse({
    res,
    message: "TEACHER_UPDATED_SUCCESSFULLY",
    data: teacher,
  });
});

export const changeTeacherStatus = asyncHandler(async (req, res, next) => {
  const teacher = await teacherService.changeTeacherStatusService(
    req.params.teacherId,
    req.body.status
  );
  return successResponse({
    res,
    message: "TEACHER_STATUS_UPDATED_SUCCESSFULLY",
    data: teacher,
  });
});

export const assignCourses = asyncHandler(async (req, res, next) => {
  const result = await teacherService.assignCoursesToTeacherService(
    req.params.teacherId,
    req.body.courseIds
  );
  return successResponse({
    res,
    message: result.message,
    data: result,
  });
});

export const updateCv = asyncHandler(async (req, res, next) => {
  const result = await teacherService.updateTeacherCvService(
    req.params.teacherId,
    req.file,
  );
  return successResponse({
    res,
    message: "TEACHER_CV_UPDATED_SUCCESSFULLY",
    data: result,
  });
});

export const deleteTeacher = asyncHandler(async (req, res, next) => {
  await teacherService.deleteTeacherService(req.params.teacherId);
  return successResponse({
    res,
    status: 204,
    message: "TEACHER_DELETED_SUCCESSFULLY",
  });
});

export const exportTeachers = asyncHandler(async (req, res, next) => {
  const workbook = await teacherService.exportTeachersToExcelService(req.query);
  const filename = `teachers_export_${new Date().toISOString().slice(0, 10)}.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
});
