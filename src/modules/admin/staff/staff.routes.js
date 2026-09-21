import { Router } from "express";
import * as staffController from "./staff.controller.js";
import * as staffValidation from "./staff.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import {
  authorize,
} from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();

router.post(
  "/",
  authentication(),
  authorize(PERMISSIONS_V2.STAFF.CREATE),
  validation(staffValidation.createStaff),
  staffController.createStaff
);

router.get(
  "/",
  authentication(),
  authorize(PERMISSIONS_V2.STAFF.READ),
  validation(staffValidation.getAllStaff),
  staffController.getAllStaff
);

router.get(
  "/roles",
  authentication(),
  authorize(PERMISSIONS_V2.STAFF.READ),
  staffController.getStaffRoles
);

router.get(
  "/export",
  authentication(),
  authorize(PERMISSIONS_V2.STAFF.READ),
  staffController.exportStaff
);

router.get(
  "/:staffId",
  authentication(),
  authorize(PERMISSIONS_V2.STAFF.READ),
  validation(staffValidation.getStaffById),
  staffController.getStaffById
);

router.patch(
  "/:staffId",
  authentication(),
  authorize(PERMISSIONS_V2.STAFF.UPDATE),
  validation(staffValidation.updateStaff),
  staffController.updateStaff
);

router.patch(
  "/:staffId/status",
  authentication(),
  authorize(PERMISSIONS_V2.STAFF.UPDATE),
  validation(staffValidation.changeStatus),
  staffController.changeStaffStatus
);

router.delete(
  "/:staffId",
  authentication(),
  authorize(PERMISSIONS_V2.STAFF.DELETE),
  validation(staffValidation.deleteStaff),
  staffController.deleteStaff
);

export default router;
