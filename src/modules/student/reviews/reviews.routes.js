import { Router } from "express";
import * as reviewsController from "./reviews.controller.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import * as validators from "./reviews.validation.js";

const router = Router();

router.use(authentication());

router.post(
  "/",
  validation(validators.addReviewSchema),
  reviewsController.addReview
);

router.get("/", reviewsController.getReviews);

export default router;
