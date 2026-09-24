import { Router } from "express";
import adminRouter from "./admin.routes.js";
import authRouter from "../modules/auth/auth.routes.js";
import teacherRouter from "./teacher.routes.js";
import notificationRouter from "../modules/admin/notifications/notifications.route.js"
const router = Router();

router.use("/admin", adminRouter);
router.use("/auth", authRouter);
router.use("/teacher", teacherRouter);
router.use("/notification", notificationRouter);

router.get("/", (req, res) => {
  res.json({ message: "Welcome to LearnX API", version: "1.0.0" });
});

export default router;