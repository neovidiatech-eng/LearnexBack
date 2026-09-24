import { Router } from "express";
import * as authController from "./auth.controller.js";
import * as authValidation from "./auth.validation.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { tokenTypeEnum } from "../../utils/Enums/token.enum.js";

const router = Router();

router.post(
  "/signup/student",
  validation(authValidation.studentSignup),
  authController.studentSignup,
);


router.post(
  "/login",
  validation(authValidation.login),
  authController.login
);

router.patch(
  "/confirm-email",
  validation(authValidation.confirmEmail),
  authController.confirmEmail
);


router.get(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.REFRESH  }),
  authController.getNewCredentials
);

export default router;
