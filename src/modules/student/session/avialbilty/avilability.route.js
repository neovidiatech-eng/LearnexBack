import { Router } from "express";
import * as availabilityController from "./avilability.controller.js";
import { authentication } from "../../../../middleware/authentication.middleware.js";
import { validation } from "../../../../middleware/validation.middleware.js";
import * as availabilityValidation from "../../session/avialbilty/avilability.validation.js"

const router = Router();

router.get(
    "/:teacherId",
    authentication(),
    validation(availabilityValidation.getAvailableSlots),
    availabilityController.getAvailableSlotsController
)




export default router;