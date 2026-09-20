import { Router } from "express";
import adminAuthRouter from "../modules/admin/auth/auth.routes.js"
import adminStudentRouter from "../modules/admin/student/student.routes.js"
import adminTeacherRouter from "../modules/admin/teacher/teacher.routes.js"
import adminCategoriesRouter from "../modules/admin/categories/categories.routes.js"
import adminCoursesRouter from "../modules/admin/courses/courses.routes.js"
import activitylogsRouter from "../modules/admin/acitvitylogs/activitylogs.route.js"


const router=Router();
  router.use("/auth", adminAuthRouter);
  router.use("/students", adminStudentRouter);
  router.use("/teachers", adminTeacherRouter);
  router.use("/categories", adminCategoriesRouter);
  router.use("/courses", adminCoursesRouter);
  router.use("/activityLogs",activitylogsRouter)




export default router