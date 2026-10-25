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
  authorize(PERMISSIONS_V2.TICKETS.READ_OWN),
  validation(ticketValidation.getMyTickets),
  ticketController.getAllTickets,
);
router.get(
  "/:ticketId",
  authorize(PERMISSIONS_V2.TICKETS.READ_OWN),
  validation(ticketValidation.getTicketById),
  ticketController.getTicketById,
);

router.post(
  "/create",
  authorize(PERMISSIONS_V2.TICKETS.CREATE),
  localFileUpload({
    customPath: (req) => `support/attachments/${req.user.id}`,
    maxSizeInMB: "5",
    validation: [...fileValidation.image, ...fileValidation.document],
  }).single("attachment"),
  validation(ticketValidation.createTicket),
  ticketController.createTicket,
);
router.post(
  "/:ticketId/send-message",
  authorize(PERMISSIONS_V2.TICKETS.SEND_MESSAGE),
  localFileUpload({
    customPath: (req) => `support/attachments/${req.user.id}`,
    maxSizeInMB: "5",
    validation: [...fileValidation.image, ...fileValidation.document],
  }).single("attachment"),
  validation(ticketValidation.sendMessage),
  ticketController.sendMessage,
);
router.post(
  "/:ticketId/reopen",
  authorize(PERMISSIONS_V2.TICKETS.REOPEN),
  localFileUpload({
    customPath: (req) => `support/attachments/${req.user.id}`,
    maxSizeInMB: "5",
    validation: [...fileValidation.image, ...fileValidation.document],
  }).single("attachment"),
  validation(ticketValidation.reopenTicket),
  ticketController.reopenTicket,
);


router.get("/:ticketId/messages",
  authorize(PERMISSIONS_V2.TICKETS.READ_OWN),
  validation(ticketValidation.getMessages),
  ticketController.getMessages, 
)






export default router;
