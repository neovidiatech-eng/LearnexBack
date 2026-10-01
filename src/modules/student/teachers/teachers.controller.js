import * as teachersService from "./teachers.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const getAllTeachers = asyncHandler(async (req, res) => {
    const teachers = await teachersService.getAllTeachersService(req.query)
    return successResponse({res,data:teachers})
})
