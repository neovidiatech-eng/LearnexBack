import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { authorizeResource } from "../../../middleware/authorization.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import * as teacherValidation from "./teacher.validation.js";
import * as teacherController from "./teacher.controller.js";
import { fileValidation } from "../../../utils/multer/fileValidation.js";
import { localFileUpload } from "../../../utils/multer/local.multer.js";
const router = Router();

router.post(
  "/",
  authentication(),
  authorizeResource("teachers"),
  validation(teacherValidation.createTeacher),
  teacherController.createTeacher,
);

router.get(
  "/",
  authentication(),
  authorizeResource("teachers"),
  validation(teacherValidation.getAllTeachers),
  teacherController.getAllTeacher,
);

router.get(
  "/:teacherId",
  authentication(),
  authorizeResource("teachers"),
  validation(teacherValidation.getTeacherById),
  teacherController.getTeacherById,
);

router.patch(
  "/:teacherId",
  authentication(),
  authorizeResource("teachers"),
  validation(teacherValidation.updateTeacher),
  teacherController.updateTeacher,
);
router.patch(
  "/:teacherId",
  authentication(),
  authorizeResource("teachers"),
  validation(teacherValidation.changeStatus),
  teacherController.changeTeacherStatus,
);
router.patch(
  "/:teacherId/assign-courses",
  authentication(),
  authorizeResource("teachers"),
  validation(teacherValidation.assignCourses),
  teacherController.assignCourses,
);
router.patch(
  "/:teacherId/cv",
  authentication(),
  authorizeResource("teachers"),
  localFileUpload({
    customPath: "teachers",
    validation: fileValidation.image,
  }).single("image"),
  validation(teacherValidation.updateCv),
  teacherController.updateCv,
);

export default router;
