import { Router } from "express";
import studentAuthRouter from "../modules/student/auth/auth.routes.js";
import studentProfileRouter from "../modules/student/profile/profile.routes.js";
const router = Router();
router.use("/auth", studentAuthRouter);
router.use("/me", studentProfileRouter);

export default router;
