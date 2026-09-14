import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { authorizeResource } from "../../../middleware/authorization.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import * as teacherValidation from "./teacher.validation.js";
import * as teacherController from "./teacher.controller.js"
const router = Router();

router.post(
  "/",
  authentication(),
  authorizeResource("teachers"),
    validation(teacherValidation.createTeacher),
  teacherController.createTeacher
);

router.get(
  "/",
  authentication(),
  authorizeResource("teachers"),
    validation(teacherValidation.getAllTeachers),
  teacherController.getAllTeacher
);
export default router;
