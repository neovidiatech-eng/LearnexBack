import { Router } from "express";
import * as planController from "./plan.controller.js";
import * as planValidation from "./plan.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import {
  authorize,
  authorizeResource,
} from "../../../middleware/authorization.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";

const router = Router();


export default router;
