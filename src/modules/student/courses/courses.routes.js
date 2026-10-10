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

// Categories
router.get(
  "/categories",
  validation(courseValidation.getCategories),
  courseController.getCategories
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

router.get(
  "/",
  validation(courseValidation.getCourseCatalog),
  courseController.getCourseCatalog
);

router.post(
  "/:courseId/enroll",
  validation(courseValidation.enrollCourse),
  courseController.enrollFreeCourse
);

router.post(
  "/:courseId/lessons/:lessonId/complete",
  validation(courseValidation.completeLesson),
  courseController.completeLesson
);

router.post(
  "/:courseId/reviews",
  validation(courseValidation.addCourseReview),
  courseController.addCourseReview
);
router.get(
  "/:courseId/reviews",
  validation(courseValidation.getCourseReviews),
  courseController.getCourseReviews
);
router.delete(
  "/:courseId/reviews",
  validation(courseValidation.deleteCourseReview),
  courseController.deleteCourseReview
);

router.get(
  "/:courseId",
  validation(courseValidation.getCourseDetails),
  courseController.getCourseDetails
);

export default router;
