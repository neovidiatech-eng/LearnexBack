import { Router } from "express";
import teacherAuthRouter from "../modules/teacher/auth/auth.routes.js";
import teacherCoursesRouter from "../modules/teacher/courses/courses.routes.js";
import teacherSectionRouter from "../modules/teacher/courses/sections/sections.routes.js"
import teacherItemsRouter from "../modules/teacher/courses/items/items.routes.js";
import teacherProfileRouter from "../modules/teacher/profile/profile.routes.js";
import teacherCertificateRouter from "../modules/teacher/certificates/certificate.routes.js";
import teacherQuizRouter from "../modules/teacher/courses/quizes/quiz.routes.js"
import teacherReviewsRouter from "../modules/teacher/reviews/reviews.routes.js";
import teacherOfferRouter from "../modules/teacher/offers/offers.routes.js";
import teacherPlans from "../modules/teacher/Plans/plan.routes.js";

const router = Router();
router.use("/auth", teacherAuthRouter);
router.use("/courses", teacherCoursesRouter);
router.use("/sections", teacherSectionRouter);
router.use("/quizes", teacherQuizRouter);
router.use("/items", teacherItemsRouter);
router.use("/me", teacherProfileRouter);
router.use("/certificates", teacherCertificateRouter);
router.use("/reviews", teacherReviewsRouter);
router.use("/offers", teacherOfferRouter);
router.use("/plans", teacherPlans);

export default router;
