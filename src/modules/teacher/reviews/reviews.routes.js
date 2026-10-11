import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import * as  reviewsController from "./reviews.controller.js";
import { authorize } from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";
const router = Router();

router.use(authentication());

router.get("/", authorize(PERMISSIONS_V2.REVIEWS.READ),reviewsController.getReviews);

export default router;

