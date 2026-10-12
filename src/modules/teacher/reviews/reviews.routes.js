import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import * as  reviewsController from "./reviews.controller.js";

const router = Router();

router.use(authentication());

router.get("/",reviewsController.getReviews);

export default router;

