import { Router } from "express";
import * as planController from "./plan.controller.js";
import * as planValidation from "./plan.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import {  
  authorize,
} from "../../../middleware/authorization.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();



router.get(
  "/",
  authentication(),
  validation(planValidation.getAllPlans),
  authorize(PERMISSIONS_V2.PLANS.READ),
  planController.getAllPlans,
)

export default router;
