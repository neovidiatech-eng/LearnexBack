import { Router } from "express";
import * as teachersController from "./teachers.controller.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { authorizeResource } from "../../../middleware/authorization.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { localFileUpload } from "../../../utils/multer/local.multer.js";
import { fileValidation } from "../../../utils/multer/fileValidation.js";
const router = Router();
router.use(authentication(), authorizeResource("students"));
router.get("/",teachersController.getAllTeachers)
router.get("/:teacherId", teachersController.getTeacherById);
export default router;