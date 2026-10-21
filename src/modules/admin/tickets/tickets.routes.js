import { Router } from "express";
import * as ticketController from "./tickets.controller.js";
import * as ticketValidation from "./tickets.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { authorize } from "../../../middleware/authorization.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { localFileUpload } from "../../../utils/multer/local.multer.js";
import { fileValidation } from "../../../utils/multer/fileValidation.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();
router.use(authentication());
router.get(
  "/",
  authorize(PERMISSIONS_V2.TICKETS.READ_ALL),
  validation(ticketValidation.getAllTickets),
  ticketController.getAllTickets,
);

router.get(
  "/:ticketId",
  authorize(PERMISSIONS_V2.TICKETS.READ),
  validation(ticketValidation.getTicketById),
  ticketController.getTicketById,
);

router.get(
  "/:ticketId/messages",
  authorize(PERMISSIONS_V2.TICKETS.READ),
  validation(ticketValidation.getMessages),
  ticketController.getMessages,
);

router.post(
  "/:ticketId/send-message",
  authorize(PERMISSIONS_V2.TICKETS.CREATE),
  localFileUpload({
    customPath: (req) => `support/attachments/${req.user.id}`,
    maxSizeInMB: 5,
    validation: [...fileValidation.image, ...fileValidation.document],
  }).single("attachment"),
  validation(ticketValidation.sendMessage),
  ticketController.sendMessage,
);

router.post(
  "/:ticketId/close",
  authorize(PERMISSIONS_V2.TICKETS.CLOSE),
  validation(ticketValidation.closeTicket),
  ticketController.closeTicket,
);

router.patch(
  "/:ticketId/status",
  authorize(PERMISSIONS_V2.TICKETS.UPDATE),
  validation(ticketValidation.changeStatus),
  ticketController.changeStatus,
);

router.patch(
  "/:ticketId/assign",
  authorize(PERMISSIONS_V2.TICKETS.ASSIGN),
  validation(ticketValidation.assignTicket),
  ticketController.assignTicket,
);

export default router;
