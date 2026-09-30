import { Router } from "express";
import * as profileController from "./profile.controller.js";
import * as profileValidation from "./profile.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { authorizeResource } from "../../../middleware/authorization.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { localFileUpload } from "../../../utils/multer/local.multer.js";
import { fileValidation } from "../../../utils/multer/fileValidation.js";

const router = Router();
router.use(authentication(), authorizeResource("students"));

router.get(
  "/profile",
  profileController.getProfile,
);

router.patch(
  "/profile",
  validation(profileValidation.updateProfile),
  profileController.updateProfile,
);

router.patch(
  "/change-password",
  validation(profileValidation.changePassword),
  profileController.changePassword,
);

router.patch(
  "/profile-image",
  localFileUpload({
    customPath: (req) => `student/profile_image/${req.user.email}`,
    validation: [...fileValidation.image],
  }).fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "coverPhoto", maxCount: 1 },
  ]),
  profileController.updateImageProfile,
);


router.delete(
  "/profile",
  profileController.deleteProfile,
);
export default router;