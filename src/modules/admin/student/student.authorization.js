import { roleEnum } from "../../../utils/Enums/role.enum.js";

export const endpoint = {
  getAllStudents: [roleEnum.ADMIN],
  getStudentById: [roleEnum.ADMIN],
  changeStatus: [roleEnum.ADMIN],
  createStudent: [roleEnum.ADMIN],
};
