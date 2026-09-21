import { Router } from "express";
import { validation } from "../../../middleware/validation.middleware.js";
import * as couponController from "./coupon.controller.js";
import * as schema from "./coupon.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import {
  authorizeResource,
  authorize,
} from "../../../middleware/authorization.middleware.js";
const router = Router();
router.use(authentication())
router.post(
  "/",
  authorizeResource("coupons"),
  validation(schema.createCoupon),
  couponController.createCoupon
);

router.get(
  "/",
  authorizeResource("coupons"),
  validation(schema.getCoupons),
  couponController.getCoupons
);

router.get(
  "/:id",
  authorizeResource("coupons"),
  validation(schema.getCouponById),
  couponController.getCouponById
);

router.patch(
  "/:id",
  authorizeResource("coupons"),
  validation(schema.updateCoupon),
  couponController.updateCoupon
);

router.delete(
  "/:id",
  authorizeResource("coupons"),
  validation(schema.deleteCoupon),
  couponController.deleteCoupon
);

router.patch(
  "/:id/toggle-status",
  authorizeResource("coupons"),
  validation(schema.getCouponById), 
  couponController.toggleCouponStatusController
);

export default router;