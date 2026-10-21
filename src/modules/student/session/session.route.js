import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import * as sessionController from "./session.controller.js";
import { authorize } from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";
import { validation } from "../../../middleware/validation.middleware.js";
import * as sessionValidation from "./session.validation.js";
import * as availabilityController from "./avialbilty/avilability.controller.js";
import * as availabilityValidation from "./avialbilty/avilability.validation.js";

const router = Router();

router.get(
  "/my-sessions",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONS.READ),
  validation(sessionValidation.getMySessions),
  sessionController.getMySessionsController,
);

router.get(
  "/requests",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONREQUESTS.VIEW),
  validation(sessionValidation.getSessionRequests),
  sessionController.getSessionRequestsController,
);

router.get(
  "/:teacherId/availability",
  authentication(),
  validation(availabilityValidation.getAvailableSlots),
  availabilityController.getAvailableSlotsController,
);

router.post(
  "/:teacherId/create-request",
    authentication(),
    validation(sessionValidation.createRequest),
    authorize(PERMISSIONS_V2.SESSIONREQUESTS.CREATE),
    sessionController.createRequestController
);

router.patch("/:requestId/cancel-request",
    authentication(),
    authorize(PERMISSIONS_V2.SESSIONREQUESTS.CANCEL),
    validation(sessionValidation.cancelRequest),
    sessionController.cancelRequestController
);

// ─── Cycle 2: Custom Sessions Request ────────────────────────
router.get(
  "/custom-requests",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONREQUESTS.VIEW),
  validation(sessionValidation.getCustomRequests),
  sessionController.getCustomRequestsController,
);

router.post(
  "/:teacherId/custom-request",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONREQUESTS.CREATE),
  validation(sessionValidation.createCustomRequest),
  sessionController.createCustomRequestController,
);

router.patch(
  "/custom-requests/:requestId/cancel",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONREQUESTS.CANCEL),
  validation(sessionValidation.cancelCustomRequest),
  sessionController.cancelCustomRequestController,
);

router.post(
  "/:sessionId/join",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONS.JOIN),
  validation(sessionValidation.joinSession),
  sessionController.joinSessionController,
);

export default router;