import { Router } from "express";
import * as courseController from "./courses.controller.js";
import * as courseValidation from "./courses.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";

const router = Router();

router.use(authentication());

// Favorites
router.get("/favorites", courseController.getFavorites);
router.patch(
  "/:courseId/favorite",
  validation(courseValidation.toggleFavorite),
  courseController.toggleFavourite,
);

// Enrolled courses (My learning)
router.get(
  "/enrolled",
  validation(courseValidation.getEnrolledCourses),
  courseController.getEnrolledCourses
);
router.get(
  "/my-learning",
  validation(courseValidation.getEnrolledCourses),
  courseController.getEnrolledCourses
);

// Direct Free Course Enrollment
router.post(
  "/:courseId/enroll",
  validation(courseValidation.enrollCourse),
  courseController.enrollFreeCourse
);

export default router;
