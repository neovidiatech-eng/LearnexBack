import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware.js";
import * as activitylogsController from "./activitylogs.controller.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validator from "./activitylogs.validation.js";

const router = Router();

router.use(authentication());

router.get("/stats",activitylogsController.getActivityStats);
router.get("/",validation(validator.getActivityLogs),activitylogsController.getActivitylogs);
router.get("/:id",validation(validator.getActivityLogById),activitylogsController.getActivitylogById);

export default router;