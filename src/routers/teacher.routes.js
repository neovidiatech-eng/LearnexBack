import { Router } from "express";
import teacherCoursesRouter from "../modules/teacher/courses/courses.routes.js";
import teacherSectionRouter from "../modules/teacher/courses/sections/sections.routes.js"

const router = Router();

router.use("/courses", teacherCoursesRouter);
router.use("/sections",teacherSectionRouter)

export default router;
