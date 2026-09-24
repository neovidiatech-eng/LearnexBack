import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import * as notificationsController from "./notifications.controller.js";
import * as validator from "./notifications.validation.js";

const router = Router();

router.use(authentication());

router.get(
  "/",
  validation(validator.getAllNotifications),
  notificationsController.getAllNotifications
);

router.post(
  "/",
  validation(validator.createNotification),
  notificationsController.createNotification
);

router.patch("/read-all", notificationsController.markAllAsRead);

router.patch(
  "/:id/read",
  validation(validator.markAsRead),
  notificationsController.markAsRead
);

router.delete(
  "/:id",
  validation(validator.deleteNotification),
  notificationsController.deleteNotification
);

export default router;
