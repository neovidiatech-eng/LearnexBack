import { Router } from "express";
import * as profileController from "./profile.controller.js";
import * as profileValidation from "./profile.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { authorizeResource } from "../../../middleware/authorization.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { localFileUpload } from "../../../utils/multer/local.multer.js";
import { fileValidation } from "../../../utils/multer/fileValidation.js";

const router = Router();

router.get(
  "/profile",
  authentication(),
  authorizeResource("teachers"),
  profileController.getProfile,
);

router.patch(
  "/profile",
  authentication(),
  authorizeResource("teachers"),
  validation(profileValidation.updateProfile),
  profileController.updateProfile,
);

router.patch(
  "/cover-image",
  authentication(),
  authorizeResource("teachers"),
  localFileUpload({
    customPath: (req) => `teacher/cover/${req.user.email}`,
    validation: fileValidation.image,
  }).single("coverImage"),
  profileController.updateCoverImage,
);


router.patch(
  "/visibility",
  authentication(),
  authorizeResource("teachers"),
  validation(profileValidation.toggleVisibility),
  profileController.toggleVisibility,
);

export default router;