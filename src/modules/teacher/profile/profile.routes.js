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

router.get(
  "/:teacherId",
  authentication(),
  authorizeResource("teachers"),
  profileController.shareProfile,
);

router.patch(
  "/profile",
  authentication(),
  authorizeResource("teachers"),
  validation(profileValidation.updateProfile),
  profileController.updateProfile,
);
router.patch(
  "/session-pricing",
  authentication(),
  authorizeResource("teachers"),
  profileController.updateSessionPrice,
);

router.patch(
  "/profile-image",
  authentication(),
  authorizeResource("teachers"),
  localFileUpload({
    customPath: (req) => `teacher/cover/${req.user.email}`,
    validation: [...fileValidation.image],
  }).fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),
  profileController.updateImageProfile,
);


router.patch(
  "/visibility",
  authentication(),
  authorizeResource("teachers"),
  validation(profileValidation.toggleVisibility),
  profileController.toggleVisibility,
);


router.delete(
  "/profile",
  authentication(),
  authorizeResource("teachers"),
  profileController.deleteProfile,
);
export default router;