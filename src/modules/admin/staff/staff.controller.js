import * as staffService from "./staff.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const createStaff = asyncHandler(async (req, res) => {
  const result = await staffService.createStaffService(req.body);
  return successResponse({
    res,
    status: 201,
    message: "STAFF_CREATED_SUCCESSFULLY",
    data: { staff: result },
  });
});

export const getAllStaff = asyncHandler(async (req, res) => {
  const result = await staffService.getAllStaffService(req.query);
  return successResponse({
    res,
    message: "STAFF_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const getStaffById = asyncHandler(async (req, res) => {
  const staff = await staffService.getStaffByIdService(req.params.staffId);
  return successResponse({
    res,
    message: "STAFF_DETAILS_FETCHED_SUCCESSFULLY",
    data: { staff },
  });
});

export const updateStaff = asyncHandler(async (req, res) => {
  const staff = await staffService.updateStaffService(
    req.params.staffId,
    req.body
  );
  return successResponse({
    res,
    message: "STAFF_UPDATED_SUCCESSFULLY",
    data: { staff },
  });
});

export const changeStaffStatus = asyncHandler(async (req, res) => {
  const staff = await staffService.changeStaffStatusService(
    req.params.staffId,
    req.body.status
  );
  return successResponse({
    res,
    message: "STAFF_STATUS_UPDATED_SUCCESSFULLY",
    data: { staff },
  });
});

export const deleteStaff = asyncHandler(async (req, res) => {
  await staffService.deleteStaffService(req.params.staffId);
  return successResponse({
    res,
    status: 200,
    message: "STAFF_DELETED_SUCCESSFULLY",
  });
});

export const getStaffRoles = asyncHandler(async (req, res) => {
  const roles = await staffService.getStaffRolesService();
  return successResponse({
    res,
    message: "STAFF_ROLES_FETCHED_SUCCESSFULLY",
    data: { roles },
  });
});

export const exportStaff = asyncHandler(async (req, res) => {
  const workbook = await staffService.exportStaffToExcelService(req.query);

  const filename = `staff_export_${new Date().toISOString().slice(0, 10)}.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  await workbook.xlsx.write(res);
  res.end();
});
