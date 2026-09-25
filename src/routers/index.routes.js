import { Router } from "express";
import adminRouter from "./admin.routes.js";
import authRouter from "../modules/auth/auth.routes.js";
import teacherAuthRouter from "../modules/teacher/auth/auth.routes.js";
import teacherProfileRouter from "../modules/teacher/profile/profile.routes.js";

const router = Router();

router.use("/admin", adminRouter);
router.use("/auth", authRouter);
router.use("/teacher/auth", teacherAuthRouter);
router.use("/teacher/me", teacherProfileRouter);

router.get("/", (req, res) => {
  res.json({ message: "Welcome to LearnX API", version: "1.0.0" });
});

export default router;