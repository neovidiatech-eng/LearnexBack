import { Router } from "express";
import adminRouter from "./admin.routes.js";
import studentRouter from "./student.routes.js";
import teacherRouter from "./teacher.routes.js";
import notificationRouter from "../modules/admin/notifications/notifications.route.js"
import settingsRouter from "../modules/settings/settings.routes.js";

const router = Router();

router.use("/admin", adminRouter);
router.use("/student", studentRouter);
router.use("/teacher", teacherRouter);
router.use("/notification", notificationRouter);
router.use("/settings", settingsRouter);

router.get("/", (req, res) => {
  res.json({ message: "Welcome to LearnX API", version: "1.0.0" });
});

export default router;