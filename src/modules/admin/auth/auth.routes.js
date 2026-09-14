import { Router } from "express";
import * as authController from "./auth.controller.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { tokenTypeEnum } from "../../../utils/security/token.security.js";
import { validation } from "../../../middleware/validation.middleware.js";
import * as validators from "./auth.validation.js";

const router = Router();

/**
 * @openapi
 * /api/v1/admin/auth/login:
 *   post:
 *     summary: Admin Login
 *     tags:
 *       - Admin Auth
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
 *                 example: admin@learnx.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123!
 *     responses:
 *       200:
 *         description: Login successful
 *       404:
 *         description: Invalid login data
 */
router.post("/login", validation(validators.login), authController.login);

/**
 * @openapi
 * /api/v1/admin/auth/refresh-token:
 *   get:
 *     summary: Refresh Admin Access Token
 *     tags:
 *       - Admin Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.get(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.refresh }),
  authController.getNewCredentials
);

export default router;
