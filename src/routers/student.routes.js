import { Router } from "express";
import studentAuthRouter from "../modules/student/auth/auth.routes.js";
import studentProfileRouter from "../modules/student/profile/profile.routes.js";
import studentCoursesRouter from "../modules/student/courses/courses.routes.js";
import studentTeacherRouter from "../modules/student/teachers/teachers.routes.js";
import studentCartRouter from "../modules/student/cart/cart.routes.js";
import studentSavedRouter from "../modules/student/saved/saved.routes.js";

const router = Router();
router.use("/auth", studentAuthRouter);
router.use("/me", studentProfileRouter);
router.use("/courses", studentCoursesRouter);
router.use("/teachers", studentTeacherRouter);
router.use("/cart", studentCartRouter);
router.use("/saved", studentSavedRouter);

export default router;
