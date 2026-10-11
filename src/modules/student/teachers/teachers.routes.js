import { Router } from "express";
import * as teachersController from "./teachers.controller.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
const router = Router();
router.use(authentication());
router.get("/",teachersController.getAllTeachers)
router.get("/:id",teachersController.getTeacherById)

export default router;