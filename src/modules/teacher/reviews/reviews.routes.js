import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";

const router = Router();

router.use(authentication());

// Placeholder handlers
router.get("/", (req, res) => res.json({ message: "COMING_SOON" }));
router.get("/stats", (req, res) => res.json({ message: "COMING_SOON" }));

export default router;

