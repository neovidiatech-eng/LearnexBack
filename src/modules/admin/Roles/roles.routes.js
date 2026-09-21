import { Router } from "express";
import * as rolesController from "./roles.controller.js";
import * as rolesValidation from "./roles.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { authorize, authorizeResource } from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();

router.post(
  "/",
  authentication(),
  authorize(PERMISSIONS_V2.ROLES.CREATE),
  validation(rolesValidation.createRole),
  rolesController.createRole
);

router.get(
  "/",
  authentication(),
  authorize(PERMISSIONS_V2.ROLES.READ),
  validation(rolesValidation.getAllRoles),
  rolesController.getAllRoles
);

router.get(
  "/:roleId",
  authentication(),
  authorize(PERMISSIONS_V2.ROLES.READ),
  validation(rolesValidation.getRoleById),
  rolesController.getRoleById
);

router.patch(
  "/:roleId",
  authentication(),
  authorize(PERMISSIONS_V2.ROLES.UPDATE),
  validation(rolesValidation.updateRole),
  rolesController.updateRole
);

router.delete(
  "/:roleId",
  authentication(),
  authorize(PERMISSIONS_V2.ROLES.DELETE),
  validation(rolesValidation.deleteRole),
  rolesController.deleteRole
);

export default router;
