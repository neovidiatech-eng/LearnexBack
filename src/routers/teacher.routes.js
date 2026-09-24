import { Router } from "express";
import teacherAuthRouter from "../modules/teacher/auth/auth.routes.js";
import teacherCoursesRouter from "../modules/teacher/courses/courses.routes.js";
import teacherSectionRouter from "../modules/teacher/courses/sections/sections.routes.js"

const router = Router();
router.use("/auth", teacherAuthRouter);
router.use("/courses", teacherCoursesRouter);
router.use("/sections",teacherSectionRouter)

export default router;
