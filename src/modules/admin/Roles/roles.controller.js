import * as rolesService from "./roles.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const createRole = asyncHandler(async (req, res) => {
  const result = await rolesService.createRoleService(req.body);
  return successResponse({
    res,
    status: 201,
    message: "ROLE_CREATED_SUCCESSFULLY",
    data: result,
  });
});

export const getAllRoles = asyncHandler(async (req, res) => {
  const result = await rolesService.getAllRolesService(req.query);
  return successResponse({
    res,
    message: "ROLES_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const getRoleById = asyncHandler(async (req, res) => {
  const result = await rolesService.getRoleByIdService(req.params.roleId, req.query);
  return successResponse({
    res,
    message: "ROLE_DETAILS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const updateRole = asyncHandler(async (req, res) => {
  const result = await rolesService.updateRoleService(
    req.params.roleId,
    req.body
  );
  return successResponse({
    res,
    message: "ROLE_UPDATED_SUCCESSFULLY",
    data: result,
  });
});

export const deleteRole = asyncHandler(async (req, res) => {
  await rolesService.deleteRoleService(req.params.roleId);
  return successResponse({
    res,
    status: 200,
    message: "ROLE_DELETED_SUCCESSFULLY",
  });
});