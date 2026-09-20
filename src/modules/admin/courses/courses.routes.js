import { Router } from "express";
import * as coursesController from "./courses.controller.js";
import * as coursesValidation from "./courses.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import {
  authorizeResource,
  authorize,
} from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";
import { fileValidation } from "../../../utils/multer/fileValidation.js";
import { localFileUpload } from "../../../utils/multer/local.multer.js";

const router = Router();

router.post(
  "/",
  authentication(),
  authorizeResource("courses"),
  localFileUpload({
    customPath: "courses",
    validation: [...fileValidation.image, ...fileValidation.video],
    maxSizeInMB: 100,
  }).fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "previewVideo", maxCount: 1 },
  ]),
  validation(coursesValidation.createCourse),
  coursesController.createCourse,
);

router.get(
  "/",
  authentication(),
  authorizeResource("courses"),
  validation(coursesValidation.getAllCourses),
  coursesController.getAllCourses,
);

router.get(
  "/:courseId",
  authentication(),
  authorizeResource("courses"),
  validation(coursesValidation.getCourseById),
  coursesController.getCourseById,
);

router.patch(
  "/:courseId",
  authentication(),
  authorizeResource("courses"),
  localFileUpload({
    customPath: "courses",
    validation: [...fileValidation.image, ...fileValidation.video],
    maxSizeInMB: 100,
  }).fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "previewVideo", maxCount: 1 },
  ]),
  validation(coursesValidation.updateCourse),
  coursesController.updateCourse,
);

router.patch(
  "/:courseId/status",
  authentication(),
  authorize(PERMISSIONS_V2.COURSES.UPDATE),
  validation(coursesValidation.updateCourseStatus),
  coursesController.updateCourseStatus,
);

router.delete(
  "/:courseId",
  authentication(),
  authorizeResource("courses"),
  validation(coursesValidation.deleteCourse),
  coursesController.deleteCourse,
);

router.delete(
  "/sections/:sectionId",
  authentication(),
  authorizeResource("courses"),
  validation(coursesValidation.deleteSection),
  coursesController.deleteSectionCourse,
);

router.post(
  "/:courseId/sections",
  authentication(),
  authorizeResource("courses"),
  validation(coursesValidation.createSection),
  coursesController.createSection,
);

router.patch(
  "/sections/:sectionId",
  authentication(),
  authorizeResource("courses"),
  validation(coursesValidation.updateSection),
  coursesController.updateSection,
);

router.post(
  "/sections/:sectionId/lessons",
  authentication(),
  authorizeResource("courses"),
  validation(coursesValidation.createLesson),
  coursesController.createLesson,
);

router.patch(
  "/lessons/:lessonId",
  authentication(),
  authorizeResource("courses"),
  validation(coursesValidation.updateLesson),
  coursesController.updateLesson,
);

router.delete(
  "/lessons/:lessonId",
  authentication(),
  authorizeResource("courses"),
  validation(coursesValidation.deleteLesson),
  coursesController.deleteLesson,
);

export default router;
