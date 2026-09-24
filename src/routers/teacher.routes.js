import { Router } from "express";
import teacherAuthRouter from "../modules/teacher/auth/auth.routes.js";

const router = Router();
router.use("/auth", teacherAuthRouter);

export default router;
