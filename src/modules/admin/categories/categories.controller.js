import * as categoriesService from "./categories.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const getAllCategories = asyncHandler(async (req, res) => {
  const result = await categoriesService.getAllCategoriesService(req.query);
  return successResponse({
    res,
    message: "CATEGORIES_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const result = await categoriesService.getCategoryByIdService(
    req.params.categoryId,
    req.query.locale,
  );
  return successResponse({
    res,
    message: "CATEGORY_DETAILS_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const result = await categoriesService.createCategoryService(
    req.body,
    req.file,
    req.query,
  );
  return successResponse({
    res,
    status: 201,
    message: "CATEGORY_CREATED_SUCCESSFULLY",
    data: result,
  });
});

export const editCategory = asyncHandler(async (req, res) => {
  const result = await categoriesService.editCategoryService(
    req.params.categoryId,
    req.body,
    req.file,
  );
  return successResponse({
    res,
    message: "CATEGORY_UPDATED_SUCCESSFULLY",
    data: result,
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoriesService.deleteCategoryService(req.params.categoryId);
  return successResponse({
    res,
    status: 204,
  });
});
