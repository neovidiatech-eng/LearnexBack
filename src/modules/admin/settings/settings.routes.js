import { Router } from "express";
import * as settingController from "./settings.controller.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { localFileUpload } from "../../../utils/multer/local.multer.js";
import { fileValidation } from "../../../utils/multer/fileValidation.js";
import { authorizeResource } from "../../../middleware/authorization.middleware.js";
const router = Router();
router.use(authentication(), authorizeResource("settings"));

router.get(
  "/pages",
  settingController.getAllPages,
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
