import { Router } from "express";
import * as teachersController from "./teachers.controller.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { bookPlanSchmea } from "./teachers.validation.js";
import { authorize } from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";
const router = Router();
router.use(authentication());
router.get("/", teachersController.getAllTeachers);
router.get("/:id", teachersController.getTeacherById);
router.post(
  "/book-plan/:id",
  validation(bookPlanSchmea),
  authorize(PERMISSIONS_V2.PLANS.BUY_PLAN),
  teachersController.bookPlan
);

export default router;
