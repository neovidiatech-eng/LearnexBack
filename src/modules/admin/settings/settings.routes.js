import { Router } from "express";
import * as settingController from "./settings.controller.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { localFileUpload } from "../../../utils/multer/local.multer.js";
import { fileValidation } from "../../../utils/multer/fileValidation.js";
import { authorize, authorizeResource } from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";
import { validation } from "../../../middleware/validation.middleware.js";
import * as schema from "./settings.validation.js"
const router = Router();
router.use(authentication(), authorizeResource("settings"));

router.get(
  "/pages",
  settingController.getAllPages,
);

router.get(
  "/commission",
  authorize(PERMISSIONS_V2.SETTINGS.READ),
  settingController.getCommission
);

router.patch(
  "/commission",
  authorize(PERMISSIONS_V2.SETTINGS.UPDATE),
  validation(schema.commission),
  settingController.updateCommission
); 

router.get(
  "/app-info",
  settingController.getAppInfo,
);

router.patch(
  "/app-info",
  localFileUpload({
    validation: fileValidation.image,
    customPath: "/settings/logoApp",
  }).single("logo_url"),
  settingController.updateAppInfo,
);

router.patch(
  "/pages/:slug",
  settingController.updatePages,
);
export default router;
