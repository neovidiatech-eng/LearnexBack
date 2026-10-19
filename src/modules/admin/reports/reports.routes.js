import { Router } from "express";
import * as reportController from "./reports.controller.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { authorize } from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";
const router = Router();
router.use(authentication());
router.get(
  "/",
  authorize(PERMISSIONS_V2.REPORTS.READ),
  reportController.getReports,
);
export default router;
