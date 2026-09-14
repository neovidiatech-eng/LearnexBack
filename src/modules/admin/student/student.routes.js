import { Router } from "express";
import * as studentController from "./student.controller.js";
import * as studentValidation from "./student.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import {
  authorizeResource,
  authorize,
} from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();

router.post(
  "/",
  authentication(),
  authorizeResource("students"),
  validation(studentValidation.createStudent),
  studentController.createStudent,
);

router.get(
  "/",
  authentication(),
  authorizeResource("students"),
  validation(studentValidation.getAllStudents),
  studentController.getAllStudents,
);

router.get(
  "/export",
  authentication(),
  authorizeResource("students"),
  studentController.exportStudents
);


router.get(
  "/:studentId",
  authentication(),
  authorizeResource("students"),
  validation(studentValidation.getStudentById),
  studentController.getStudentById,
);

router.patch(
  "/:studentId",
  authentication(),
  authorize(PERMISSIONS_V2.STUDENTS.UPDATE),
  validation(studentValidation.updateStudent),
  studentController.updateStudent,
);
router.patch(
  "/:studentId/status",
  authentication(),
  authorize(PERMISSIONS_V2.STUDENTS.UPDATE),
  validation(studentValidation.changeStatus),
  studentController.changeStudentStatus,
);
router.delete(
  "/:studentId",
  authentication(),
  authorize(PERMISSIONS_V2.STUDENTS.DELETE),
  validation(studentValidation.getStudentById),
  studentController.deleteStudent
);

export default router;
