import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import * as reviewsController from "./reviews.controller.js";
import { getTeacherReviewsSchema } from "./reviews.validation.js";

const router = Router();

router.use(authentication());

router.get("/", validation(getTeacherReviewsSchema), reviewsController.getReviews);

export default router;

