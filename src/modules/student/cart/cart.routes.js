import { Router } from "express";
import * as cartController from "./cart.controller.js";
import * as cartValidation from "./cart.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";

const router = Router();

router.use(authentication());

router.get("/", cartController.getCart);

router.post(
  "/add",
  validation(cartValidation.addToCart),
  cartController.addToCart,
);

router.delete(
  "/remove/:itemId",
  validation(cartValidation.removeFromCart),
  cartController.removeFromCart,
);

router.delete("/clear", cartController.clearCart);

router.post("/checkout", cartController.checkoutCart);



export default router;
