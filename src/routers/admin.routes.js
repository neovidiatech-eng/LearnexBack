import { Router } from "express";




const router=Router();
  app.use("/auth", adminAuthRouter);
  app.use("/students", adminStudentRouter);
  app.use("/teachers", adminTeacherRouter);
  app.use("/categories", adminCategoriesRouter);
  app.use("/courses", adminCoursesRouter);





export default router