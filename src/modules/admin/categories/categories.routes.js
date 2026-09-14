import { Router } from "express";
import * as categoriesController from "./categories.controller.js";
import * as validator from "./categories.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { authorizeResource } from "../../../middleware/authorization.middleware.js";
import { fileValidation } from "../../../utils/multer/fileValidation.js";
import { localFileUpload } from "../../../utils/multer/local.multer.js";

const router = Router();

router.get(
  "/",
  authentication(),
  authorizeResource("categories"),
  validation(validator.getAllCategories),
  categoriesController.getAllCategories
);

router.get(
  "/:categoryId",
  authentication(),
  authorizeResource("categories"),
  validation(validator.getCategoryById),
  categoriesController.getCategoryById
);


router.post(
  "/",
  authentication(),
  authorizeResource("categories"),
  localFileUpload({
    customPath: "categories",
    validation: fileValidation.image,
  }).single("image"),
  validation(validator.createCategory),
  categoriesController.createCategory,
);


router.patch(
  "/:categoryId",
  authentication(),
  authorizeResource("categories"),
  localFileUpload({
    customPath: "categories",
    validation: fileValidation.image,
  }).single("image"),
  validation(validator.editCategory),
  categoriesController.editCategory
);

router.delete(
  "/:categoryId",
  authentication(),
  authorizeResource("categories"),
  validation(validator.deleteCategory),
  categoriesController.deleteCategory
);

export default router;
