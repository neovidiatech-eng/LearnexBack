import { Router } from "express";

import adminAuthRouter from "../modules/admin/auth/auth.routes.js";
import adminStudentRouter from "../modules/admin/student/student.routes.js";
import adminTeacherRouter from "../modules/admin/teacher/teacher.routes.js";
import adminCategoriesRouter from "../modules/admin/categories/categories.routes.js";
import adminCoursesRouter from "../modules/admin/courses/courses.routes.js";
import adminBannersRouter from "../modules/admin/banners/banners.route.js";
import activitylogsRouter from "../modules/admin/acitvitylogs/activitylogs.route.js";
import adminRolesRouter from "../modules/admin/Roles/roles.routes.js";
import adminStaffRouter from "../modules/admin/staff/staff.routes.js";
import adminCouponRouter from "../modules/admin/coupons/coupon.route.js"
import adminOfferRouter from "../modules/admin/offers/offers.routes.js";
import adminSettingsRouter from "../modules/admin/settings/settings.routes.js";
import adminStatesRouter from "../modules/admin/states/states.routes.js";
import adminReportsRouter from "../modules/admin/reports/reports.routes.js";
import adminCalendarRouter from "../modules/admin/calendar/calendar.routes.js";
import adminPlansRouter from "../modules/admin/Plans/plan.routes.js";
import adminReviewRouter from "../modules/admin/reviews/reviews.routes.js";
import adminRequestsRouter from "../modules/admin/requests/requests.routes.js";
import adminSessionsRouter from "../modules/admin/sessions/session.routes.js";
import adminTicketsRouter from "../modules/admin/tickets/tickets.routes.js";
import adminCertificatesRouter from "../modules/admin/certificates/certificates.route.js";
import adminFinanceRouter from "../modules/admin/finance/finance.routes.js";

const router = Router();
router.use("/auth", adminAuthRouter);
router.use("/students", adminStudentRouter);
router.use("/teachers", adminTeacherRouter);
router.use("/categories", adminCategoriesRouter);
router.use("/courses", adminCoursesRouter);
router.use("/banners", adminBannersRouter);
router.use("/activityLogs", activitylogsRouter);
router.use("/roles", adminRolesRouter);
router.use("/staff", adminStaffRouter);
router.use("/offers",adminOfferRouter)
router.use("/coupons",adminCouponRouter);
router.use("/settings",adminSettingsRouter);
router.use("/states",adminStatesRouter);
router.use("/reports",adminReportsRouter);
router.use("/calendar",adminCalendarRouter);
router.use("/plans",adminPlansRouter);
router.use("/reviews",adminReviewRouter);
router.use("/requests", adminRequestsRouter);
router.use("/sessions", adminSessionsRouter);
router.use("/tickets", adminTicketsRouter);
router.use("/certificates", adminCertificatesRouter);
router.use("/finance", adminFinanceRouter);

export default router;

