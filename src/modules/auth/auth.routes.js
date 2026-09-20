import { Router } from "express";
import * as authController from "./auth.controller.js";
import * as authValidation from "./auth.validation.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import { tokenTypeEnum } from "../../utils/Enums/token.enum.js";

const router = Router();

/**
 * @openapi
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - phone
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Test User
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecretPassword123!
 *               phone:
 *                 type: string
 *                 example: "01012345678"
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already exists
 */
router.post(
  "/signup",
  validation(authValidation.signup),
  authController.signup,
);
router.post(
  "/teacher/signup",
  validation(authValidation.teacherSignup),
  authController.teacherSignup,
);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: User Login
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecretPassword123!
 *     responses:
 *       200:
 *         description: Login successful
 *       404:
 *         description: Invalid login data
 */
router.post(
  "/login",
  validation(authValidation.login),
  authController.login
);

/**
 * @openapi
 * /api/v1/auth/confirm-email:
 *   patch:
 *     summary: Confirm user email with OTP
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email confirmed successfully
 *       400:
 *         description: Invalid OTP
 *       404:
 *         description: Invalid account or already verified
 */
router.patch(
  "/confirm-email",
  validation(authValidation.confirmEmail),
  authController.confirmEmail
);

/**
 * @openapi
 * /api/v1/auth/refresh-token:
 *   get:
 *     summary: Refresh access token
 *     tags:
 *       - Auth
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
