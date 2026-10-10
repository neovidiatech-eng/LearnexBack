import { Router } from "express";
import studentAuthRouter from "../modules/student/auth/auth.routes.js";
import studentProfileRouter from "../modules/student/profile/profile.routes.js";
import studentCoursesRouter from "../modules/student/courses/courses.routes.js";
import studentHomeRouter from "../modules/student/home/home.routes.js";
import studentTeacherRouter from "../modules/student/teachers/teachers.routes.js";
import studentCartRouter from "../modules/student/cart/cart.routes.js";
import studentSavedRouter from "../modules/student/saved/saved.routes.js";
import studentQuizRouter from "../modules/student/quizzes/quizzes.routes.js";
import studentReviewsRouter from "../modules/student/reviews/reviews.routes.js";

const router = Router();
router.use("/home", studentHomeRouter);
router.use("/courses/home", studentHomeRouter);
router.use("/auth", studentAuthRouter);
router.use("/me", studentProfileRouter);
router.use("/courses", studentCoursesRouter);
router.use("/categories", (req, res, next) => {
  req.url = "/categories" + (req.url === "/" ? "" : req.url);
  studentCoursesRouter(req, res, next);
});
router.use("/teachers", studentTeacherRouter);
router.use("/cart", studentCartRouter);
router.use("/saved", studentSavedRouter);
router.use("/quizzes", studentQuizRouter);
router.use("/quizes", studentQuizRouter);
router.use("/reviews", studentReviewsRouter);

export default router;
