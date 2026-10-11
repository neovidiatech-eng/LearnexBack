import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import * as  reviewsController from "./reviews.controller.js";
const router = Router();

router.use(authentication());

router.get("/", reviewsController.getReviews);
router.get("/stats", (req, res) => res.json({ message: "COMING_SOON" }));

export default router;

