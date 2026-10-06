import { Router } from "express";
import * as stateController from "./states.controller.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { authorize } from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";
const router = Router();
router.use(authentication(), authorize(PERMISSIONS_V2.DASHBOARD.READ));
router.get("/",stateController.getStates);
export default router;
