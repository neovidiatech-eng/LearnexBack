import { Router } from "express";
import * as authController from "./auth.controller.js";
import * as authValidation from "./auth.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";

import { tokenTypeEnum } from "../../../utils/Enums/token.enum.js";
import { localFileUpload } from "../../../utils/multer/local.multer.js";
import { fileValidation } from "../../../utils/multer/fileValidation.js";

const router = Router();

/**
 * @openapi
 * /api/v1/teacher/auth/signup:
 *   post:
 *     summary: Teacher Signup Application (with CV Upload)
 *     tags:
 *       - Teacher Auth
 *     consumes:
 *       - multipart/form-data
 *     responses:
 *       201:
 *         description: Teacher application submitted successfully (Pending Admin Review)
 */
router.post(
  "/signup",
  localFileUpload({
    customPath: (req) =>`teacher/cv/${req.body.email}`,
    validation: [...fileValidation.document, ...fileValidation.image], 
    maxSizeInMB: 10,
  }).single("cv"),
  validation(authValidation.teacherSignup),
  authController.signup
);

/**
 * @openapi
 * /api/v1/teacher/auth/login:
 *   post:
 *     summary: Teacher Login
 *     tags:
 *       - Teacher Auth
 *     responses:
 *       200:
 *         description: Teacher login successful
 *       403:
 *         description: Account under review or not active
 */
router.post(
  "/login",
  validation(authValidation.login),
  authController.login
);

/**
 * @openapi
 * /api/v1/teacher/auth/refresh-token:
 *   get:
 *     summary: Refresh Teacher Access Token
 *     tags:
 *       - Teacher Auth
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 */
router.get(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.refresh }),
  authController.getNewCredentials
);

export default router;
