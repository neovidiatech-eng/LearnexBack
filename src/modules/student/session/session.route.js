import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import * as sessionController from "./session.controller.js";
import { authorize } from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";
import { validation } from "../../../middleware/validation.middleware.js";
import * as sessionValidation from "./session.validation.js";

const router = Router();

router.post("/:teacherId/create-request",
    authentication(),
    validation(sessionValidation.createRequest),
    authorize(PERMISSIONS_V2.SESSIONREQUESTS.CREATE),
    sessionController.createRequestController
);

router.patch("/:requestId/cancel-request",
    authentication(),
    authorize(PERMISSIONS_V2.SESSIONREQUESTS.CANCEL),
    validation(sessionValidation.cancelRequest),
    sessionController.cancelRequestController
);


export default router;