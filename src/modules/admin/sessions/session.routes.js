import { Router } from "express";
import * as sessionController from "./session.controller.js";
import * as sessionValidation from "./session.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { authorize } from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();

router.use(authentication());

router.get(
  "/",
  authorize(PERMISSIONS_V2.SESSIONS.READ),
  validation(sessionValidation.getSessions),
  sessionController.getSessions
);

router.get(
  "/:sessionId",
  authorize(PERMISSIONS_V2.SESSIONS.READ),
  validation(sessionValidation.getSessionById),
  sessionController.getSessionById
);

export default router;
