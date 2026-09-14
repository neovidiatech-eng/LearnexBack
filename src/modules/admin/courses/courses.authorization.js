import { roleEnum } from "../../../utils/Enums/role.enum.js";

export const coursesEndpoints = {
  createCourse: [roleEnum.ADMIN],
  getAllCourse: [roleEnum.ADMIN],
  getCourseById: [roleEnum.ADMIN],
};
