import { Router } from "express";
import adminAuthRouter from "../modules/admin/auth/auth.routes.js";
import adminStudentRouter from "../modules/admin/student/student.routes.js";
import adminTeacherRouter from "../modules/admin/teacher/teacher.routes.js";
import adminCategoriesRouter from "../modules/admin/categories/categories.routes.js";
import adminCoursesRouter from "../modules/admin/courses/courses.routes.js";
import activitylogsRouter from "../modules/admin/acitvitylogs/activitylogs.route.js";
import adminRolesRouter from "../modules/admin/Roles/roles.routes.js";
import adminStaffRouter from "../modules/admin/staff/staff.routes.js";

const router = Router();
router.use("/auth", adminAuthRouter);
router.use("/students", adminStudentRouter);
router.use("/teachers", adminTeacherRouter);
router.use("/categories", adminCategoriesRouter);
router.use("/courses", adminCoursesRouter);
router.use("/activityLogs", activitylogsRouter);
router.use("/roles", adminRolesRouter);
router.use("/staff", adminStaffRouter);

export default router;