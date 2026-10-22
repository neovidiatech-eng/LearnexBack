import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as chatValidation from "./chat.validation.js";
import * as chatController from "./chat.controller.js";

const router = Router();

router.use(authentication());

router.get(
  "/unread-count",
  chatController.getUnreadCount
);

router.get(
  "/conversations",
  validation(chatValidation.getConversations),
  chatController.getConversations
);

router.get(
  "/conversations/:conversationId/messages",
  validation(chatValidation.getMessages),
  chatController.getMessages
);

router.post(
  "/conversations",
  validation(chatValidation.startConversation),
  chatController.startConversation
);

router.patch(
  "/conversations/:conversationId/read",
  validation(chatValidation.markAsRead),
  chatController.markAsRead
);

export default router;