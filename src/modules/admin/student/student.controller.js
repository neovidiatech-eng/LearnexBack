import * as studentService from "./student.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const createStudent = asyncHandler(async (req, res) => {
  const result = await studentService.createStudentsService(req.body);
  return successResponse({
    res,
    message: "STUDENT_CREATED_SUCCESSFULLY",
    data: result,
  });
});

export const getAllStudents = asyncHandler(async (req, res) => {
  const result = await studentService.getAllStudentsService(req.query);
  return successResponse({
    res,
    message: "STUDENTS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const getStudentById = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentByIdService(
    req.params.studentId
  );
  return successResponse({
    res,
    message: "STUDENT_DETAILS_FETCHED_SUCCESSFULLY",
    data: { student },
  });
});
export const updateStudent = asyncHandler(async (req, res) => {
  const student = await studentService.updateStudentService(
    req.body,
    req.params.studentId,
  );
  return successResponse({
    res,
    message: "STUDENT_DETAILS_UPDATED_SUCCESSFULLY",
    data: { student },
  });
});

export const changeStudentStatus = asyncHandler(async (req, res) => {
  const student = await studentService.changeStudentStatusService(
    req.params.studentId,
    req.body.status
  );
  return successResponse({
    res,
    message: "STUDENT_STATUS_UPDATED_SUCCESSFULLY",
    data: { student },
  });
});


export const deleteStudent = asyncHandler(async (req, res) => {
  await studentService.deleteStudentService(
    req.params.studentId,
  );
  return successResponse({
    res,
    status:204,
    message: "STUDENT_DELETED_SUCCESSFULLY",
    
  });
});


export const exportStudents = asyncHandler(async (req, res) => {
  const workbook = await studentService.exportStudentsToExcelService(req.query);

  const filename = `students_export_${new Date().toISOString().slice(0, 10)}.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
});
