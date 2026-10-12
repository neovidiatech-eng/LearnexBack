import { Router } from "express";
import * as liveController from "./liveSession.controller.js";
import * as schema from "./liveSession.validation.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { authorize } from "../../middleware/authorization.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { PERMISSIONS_V2 } from "../../Constants/permissions.constants.js";

const router = Router();

// ─── Teacher: إنشاء session ───────────────────────────────────────────────────
router.post(
  "/",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONS.CREATE),
  validation(schema.createLiveSessionSchema),
  liveController.createLiveSession
);

// ─── Student routes (لازم يجوا قبل /:id عشان ما يتاخدوش كـ param) ───────────
router.get(
  "/student/upcoming",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONS.READ),
  validation(schema.getStudentUpcomingLiveSessionsSchema),
  liveController.getStudentUpcomingLiveSessions
);

router.get(
  "/student/next",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONS.READ),
  liveController.getStudentNextLiveSession
);

// ─── Admin / any authenticated: جلب كل الـ sessions ─────────────────────────
router.get(
  "/",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONS.READ),
  liveController.getAllLiveSessions
);

// ─── أي authenticated (teacher أو student): join ─────────────────────────────
router.patch(
  "/:id/join",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONS.JOIN),
  validation(schema.liveSessionIdSchema),
  liveController.joinLiveSession
);

// ─── Teacher: start session ───────────────────────────────────────────────────
router.patch(
  "/:id/start",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONS.START),
  validation(schema.liveSessionIdSchema),
  liveController.startLiveSession
);

// ─── Teacher: end session ─────────────────────────────────────────────────────
router.patch(
  "/:id/end",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONS.END),
  validation(schema.liveSessionIdSchema),
  liveController.endLiveSession
);

// ─── Teacher: update session ──────────────────────────────────────────────────
router.patch(
  "/:id",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONS.UPDATE),
  validation(schema.updateLiveSessionSchema),
  liveController.updateLiveSession
);

// ─── Any authenticated: get single session ────────────────────────────────────
router.get(
  "/:id",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONS.READ),
  validation(schema.liveSessionIdSchema),
  liveController.getLiveSession
);

// ─── Teacher / Admin: delete session ─────────────────────────────────────────
router.delete(
  "/:id",
  authentication(),
  authorize(PERMISSIONS_V2.SESSIONS.DELETE),
  validation(schema.liveSessionIdSchema),
  liveController.deleteLiveSession
);

export default router;