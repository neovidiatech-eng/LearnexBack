import { Router } from "express";
import * as authController from "./auth.controller.js";
import * as authValidation from "./auth.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { tokenTypeEnum } from "../../../utils/Enums/token.enum.js";
import { loginRateLimiter, otpRateLimiter, authRateLimiter } from "../../../middleware/rateLimiter.middleware.js";

const router = Router();

router.post(
  "/signup",
  validation(authValidation.studentSignup),
  authController.studentSignup,
);

router.post("/login", loginRateLimiter, validation(authValidation.login), authController.login);

router.patch(
  "/confirm-email",
  otpRateLimiter,
  validation(authValidation.confirmEmail),
  authController.confirmEmail,
);

router.post(
  "/forgot-password",
  authRateLimiter,
  validation(authValidation.forgotPassword),
  authController.forgotPassword,
);

router.patch(
  "/reset-password",
  otpRateLimiter,
  validation(authValidation.resetPassword),
  authController.resetPassword,
);

router.get(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.REFRESH }),
  authController.getNewCredentials,
);

export default router;
