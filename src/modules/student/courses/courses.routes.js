import { Router } from "express";
import * as courseController from "./courses.controller.js";
import * as courseValidation from "./courses.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";

const router = Router();

router.use(authentication());
router.get("/favorites", courseController.getFavorites);

router.patch(
  "/:courseId/favorite",
  validation(courseValidation.toggleFavorite),
  courseController.toggleFavourite,
);

export default router;
