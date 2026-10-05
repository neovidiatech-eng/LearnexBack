import { Router } from "express";
import * as savedController from "./saved.controller.js";
import * as savedValidation from "./saved.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";

const router = Router();

router.use(authentication());

router.get("/", savedController.getSaved);

router.post(
  "/add",
  validation(savedValidation.addToSaved),
  savedController.addToSaved,
);

router.delete(
  "/remove/:itemId",
  validation(savedValidation.removeFromSaved),
  savedController.removeFromSaved,
);

router.delete(
  "/:itemId",
  validation(savedValidation.removeFromSaved),
  savedController.removeFromSaved,
);

router.delete("/clear", savedController.clearSaved);

export default router;
