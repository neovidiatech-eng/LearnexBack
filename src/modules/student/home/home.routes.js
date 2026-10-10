import { Router } from "express";
import * as homeController from "./home.controller.js";
import { authentication } from "../../../middleware/authentication.middleware.js";

const router = Router();

// Strictly require student authentication
router.use(authentication());

router.get("/", homeController.getStudentHomeData);

export default router;
