import { Router } from "express";
import * as reviewsController from "./reviews.controller.js";
import { authentication } from "../../../middleware/authentication.middleware.js";

const router = Router();

router.use(authentication());

router.post("/", reviewsController.addReview);
router.get("/", reviewsController.getReviews);

export default router;

