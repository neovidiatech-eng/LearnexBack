import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import * as reviewsController from "./reviews.controller.js";
import { authorizeResource } from "../../../middleware/authorization.middleware.js";

const router = Router();

router.use(authentication());

router.get(
  "/stats",
  authorizeResource("reviews"),
  reviewsController.getReviewStats,
);

router.get(
  "/",
  authorizeResource("reviews"),
  reviewsController.getReviews,
);

router.get(
  "/:reviewId",
  authorizeResource("reviews"),
  reviewsController.getReviewById,
);

router.patch(
  "/:reviewId/status",
  authorizeResource("reviews"),
  reviewsController.toggleReviewVisibility,
);
router.patch(
  "/:reviewId/visibility",
  authorizeResource("reviews"),
  reviewsController.toggleReviewVisibility,
);

router.delete(
  "/:reviewId",
  authorizeResource("reviews"),
  reviewsController.deleteReview,
);

export default router;
