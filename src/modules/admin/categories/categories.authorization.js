import { roleEnum } from "../../../utils/Enums/role.enum.js";

export const endpoint = {
  getAllCategories: [roleEnum.ADMIN],
  createCategory: [roleEnum.ADMIN],
  editCategory: [roleEnum.ADMIN],
  deleteCategory: [roleEnum.ADMIN],
};
