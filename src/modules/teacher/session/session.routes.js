
import { Router } from "express";
import * as sessionController from "./session.conroller.js";
import * as sessionValidation from "./session.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { authorize } from "../../../middleware/authorization.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();

router.use(authentication());

router.get(
  "/requests",
  authorize(PERMISSIONS_V2.SESSIONREQUESTS.VIEW),
  validation(sessionValidation.getSessionRequests),
  sessionController.getTeacherSessionRequestsController,
);

router.patch(
    "/requests/:requestId/accept",
    authorize(PERMISSIONS_V2.SESSIONREQUESTS.ACCEPT),
    validation(sessionValidation.acceptRequest),
    sessionController.acceptRequestController
)

router.patch(
    "/requests/:requestId/reject",
    authorize(PERMISSIONS_V2.SESSIONREQUESTS.REJECT),
    validation(sessionValidation.rejectRequest),
    sessionController.rejectRequestController
)
router.get(
  "/my-sessions",
  authorize(PERMISSIONS_V2.SESSIONS.READ),
  validation(sessionValidation.getMySessions),
  sessionController.getMySessionsController
)

router.patch(
  "/:sessionId/start",
  authorize(PERMISSIONS_V2.SESSIONS.START),
  validation(sessionValidation.startSession),
  sessionController.startSessionController
)

router.patch(
  "/:sessionId/end",
  authorize(PERMISSIONS_V2.SESSIONS.END),
  validation(sessionValidation.endSessionValidation),
  sessionController.endSessionController
);

// ─── Cycle 2: Teacher Custom Session Requests ────────────────
router.get(
  "/custom-requests",
  authorize(PERMISSIONS_V2.SESSIONREQUESTS.VIEW),
  validation(sessionValidation.getSessionRequests),
  sessionController.getTeacherCustomRequestsController
);

router.patch(
  "/custom-requests/:requestId/accept",
  authorize(PERMISSIONS_V2.SESSIONREQUESTS.ACCEPT),
  validation(sessionValidation.acceptRequest),
  sessionController.acceptCustomRequestController
);

router.patch(
  "/custom-requests/:requestId/reject",
  authorize(PERMISSIONS_V2.SESSIONREQUESTS.REJECT),
  validation(sessionValidation.rejectRequest),
  sessionController.rejectCustomRequestController
);

export default router;

