import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { authorizeResource } from "../../../middleware/authorization.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import * as teacherValidation from "./teacher.validation.js";
import * as teacherController from "./teacher.controller.js";
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
  "/export",
  authentication(),
  authorizeResource("teachers"),
  teacherController.exportTeachers,
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

router.delete(
  "/:teacherId",
  authentication(),
  authorizeResource("teachers"),
  validation(teacherValidation.getTeacherById),
  teacherController.deleteTeacher,
);
//requests

router.patch(
  "/requests/:teacherId/approve",
  authentication(),
  authorizeResource("teachers"),
  validation(teacherValidation.approveTeacherConfirm),
  teacherController.approveTeacher,
);

router.patch(
  "/requests/:teacherId/reject",
  authentication(),
  authorizeResource("teachers"),
  validation(teacherValidation.rejectTeacherConfirm),
  teacherController.rejectTeacher,
);

router.patch(
  "/certificate/:certificateId/verify",
  authentication(),
  authorizeResource("teachers"),
  teacherController.verifyCertificate,
);

router.patch(
  "/certificate/:certificateId/reject",
  authentication(),
  authorizeResource("teachers"),
  teacherController.rejectCertificate,
);

router.patch("/:courseId/change-status",
  authentication(),
  authorizeResource("teachers"),
  validation(teacherValidation.changeTeacherCourseStatusSchema),
  teacherController.changeTeacherCourseStatus,
);
export default router;

