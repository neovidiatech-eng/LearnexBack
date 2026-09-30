import { Router } from "express";
import * as settingsController from "./settings.controller.js";
import * as settingsValidation from "./settings.validation.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";

const router = Router();
router.get(
  "/app-info",
  authentication(),
  settingsController.getAppInfo,
);
router.get(
  "/pages/:slug",
  authentication(),
  settingsController.getPageBySlug,
);
router.get(
  "/pages",
  settingsController.getAllPages,
);
router.patch(
  "/language",
  authentication(), 
  validation(settingsValidation.changeLanguageSchema),
  settingsController.changeLanguage,
);


export default router;
