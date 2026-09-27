import { Router } from "express";
import teacherAuthRouter from "../modules/teacher/auth/auth.routes.js";
import teacherCoursesRouter from "../modules/teacher/courses/courses.routes.js";
import teacherSectionRouter from "../modules/teacher/courses/sections/sections.routes.js"
import teacherItemsRouter from "../modules/teacher/courses/items/items.routes.js";
import teacherProfileRouter from "../modules/teacher/profile/profile.routes.js";
import teacherCertificateRouter from "../modules/teacher/certificates/certificate.routes.js";

const router = Router();
router.use("/auth", teacherAuthRouter);
router.use("/courses", teacherCoursesRouter);
router.use("/sections", teacherSectionRouter);
router.use("/items", teacherItemsRouter);
router.use("/me", teacherProfileRouter);
router.use("/certificates", teacherCertificateRouter);

export default router;
