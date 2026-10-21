import { Router } from "express";
import * as calendarController from "./calendar.controller.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import {  
  authorize,
} from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();

router.get(
  "/",
  authentication(),
  authorize(PERMISSIONS_V2.CALENDAR.READ),
  calendarController.getCalendar,
)

router.get(
  "/session/:id",
  authentication(),
  authorize(PERMISSIONS_V2.CALENDAR.READ),
  calendarController.getCalendarById,
)

export default router;
