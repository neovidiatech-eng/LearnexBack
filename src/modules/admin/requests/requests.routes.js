import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import * as requestsController from "./requests.controller.js";

const router = Router();
router.use(authentication());

router.get("/stats", requestsController.getRequestStats);

router.get("/", requestsController.getAllRequests);

router.get("/:requestId", requestsController.getRequestById);

// router.patch("/:requestId/approve", requestsController.approveRequest);

// router.patch("/:requestId/reject", requestsController.rejectRequest);


export default router;
