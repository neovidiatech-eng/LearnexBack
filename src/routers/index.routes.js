import { Router } from "express";
import adminRouter from "./admin.routes.js";
import authRouter from "../modules/auth/auth.routes.js"




const router=Router();

router.use("/admin", adminRouter);
router.use("/auth", authRouter)



export default router