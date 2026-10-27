import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import * as bannersController from "./banners.controller.js";
import { validation } from "../../../middleware/validation.middleware.js";
import * as validator from "./banners.validation.js";
import { authorize } from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";
import { fileValidation } from "../../../utils/multer/fileValidation.js";
import { localFileUpload } from "../../../utils/multer/local.multer.js";

const router = Router();

router.use(authentication());

router.get(
  "/",
  authorize(PERMISSIONS_V2.BANNERS.READ),
  validation(validator.getAllBanners),
  bannersController.getAllBanners,
);
router.get(
  "/:id",
  authorize(PERMISSIONS_V2.BANNERS.READ),
  validation(validator.getBannerById),
  bannersController.getBannerById,
);
router.post(
  "/",
  authorize(PERMISSIONS_V2.BANNERS.CREATE),
  localFileUpload({
    customPath: "banners",
    validation: fileValidation.image,
  }).single("image"),
  validation(validator.createBanner),
  bannersController.createBanner,
);
router.patch(
  "/:id",
  authorize(PERMISSIONS_V2.BANNERS.UPDATE),
  localFileUpload({
    customPath: "banners",
    validation: fileValidation.image,
  }).single("image"),
  validation(validator.updateBanner),
  bannersController.updateBanner,
);
router.patch(
  "/:id/status",
  authorize(PERMISSIONS_V2.BANNERS.UPDATE),
  validation(validator.updateBannerStatus),
  bannersController.updateBannerStatus,
);
router.delete(
  "/:id",
  authorize(PERMISSIONS_V2.BANNERS.DELETE),
  validation(validator.deleteBanner),
  bannersController.deleteBanner,
);


router.patch("/:id/re-order",
  authorize(PERMISSIONS_V2.BANNERS),
  validation(validator.reOrderBanner),
  bannersController.reOrderBanner

  
)

export default router;
