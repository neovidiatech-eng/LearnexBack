import { Router } from "express";
import * as chatController from "./chat.controller.js";
import * as chatValidation from "./chat.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { authorize, authorizeResource } from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();

router.use(authentication());

router.get(
  ["/", "/conversations"],
  authorize(PERMISSIONS_V2.CHAT.READ),
  validation(chatValidation.getConversationsValidation),
  chatController.getConversations
);

export default router;
