import { Router } from "express";
import * as planController from "./plan.controller.js";
import * as planValidation from "./plan.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import {
  authorize,
  authorizeResource,
} from "../../../middleware/authorization.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();
router.use(authentication());

router.get(
  "/me",
  authorize(PERMISSIONS_V2.PLANS.GET_MY_PLANS),
  validation(planValidation.getMyPlans),
  planController.getMyPlansController,
);

router.get(
  "/:planId",
  authentication(),
  validation(planValidation.getPlanById),
  authorize(PERMISSIONS_V2.PLANS.READ),
  planController.getPlanById,
);

router.post(
  "/",
  authorize(PERMISSIONS_V2.PLANS.CREATE),
  validation(planValidation.createPlan),
  planController.createPlan,
);

router.delete(
  "/:planId",
  authorize(PERMISSIONS_V2.PLANS.DELETE),
  validation(planValidation.deletePlan),
  planController.deletePlan,
);
router.patch(
  "/:planId",
  authorize(PERMISSIONS_V2.PLANS.UPDATE),
  validation(planValidation.updatePlan),
  planController.updatePlan,
);

export default router;
