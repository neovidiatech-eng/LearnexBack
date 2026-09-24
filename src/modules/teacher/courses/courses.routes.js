import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js"
import { validation } from "../../../middleware/validation.middleware.js";
import * as courseValidation from "./courses.validation.js"
import * as courseController from "./courses.controller.js"
import { localFileUpload } from "../../../utils/multer/local.multer.js";
import { fileValidation } from "../../../utils/multer/fileValidation.js";

const router = Router();

router.post(
    "/",
    authentication(),
    localFileUpload({
        customPath: "teacherCourse",
        validation: fileValidation.image
    }).single("wallPaper"),
    validation(courseValidation.createCourseSchema),
    courseController.createTeacherCourse
)
router.get(
    "/",
    authentication(),
    validation(courseValidation.getTeacherCoursesSchema),
    courseController.getCourses
);

router.get("/:id",
    authentication(),
    validation(courseValidation.getCourseByIdSchema),
    courseController.getCourseById
)

router.patch("/:id",
    authentication(),
    localFileUpload({
        customPath: "teacherCourse",
        validation: fileValidation.image
    }).single("wallPaper"),
    validation(courseValidation.updateCourseSchema),
    courseController.updateTeacherCourse
)

router.delete("/:id",
    authentication(),
    validation(courseValidation.getCourseByIdSchema),
    courseController.deleteCourse
)

export default router;