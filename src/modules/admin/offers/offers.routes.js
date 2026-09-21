import { Router } from "express";
import * as offerController from "./offers.controller.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { authorizeResource } from "../../../middleware/authorization.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import * as validator from "./offers.validation.js";
const router = Router();

router.post(
  "/",
  authentication(),
  authorizeResource("offers"),
  validation(validator.createOffer),
  offerController.createOffer,
);

router.get(
  "/",
  authentication(),
  authorizeResource("offers"),
  validation(validator.getAllOffers),
  offerController.getAllOffers,
);

router.get(
  "/:offerId",
  authentication(),
  authorizeResource("offers"),
  validation(validator.getOfferById),
  offerController.getOfferById,
);
router.patch(
  "/:offerId",
  authentication(),
  authorizeResource("offers"),
  validation(validator.updateOffer),
  offerController.updateOffer,
);

router.patch(
  "/:offerId/status",
  authentication(),
  authorizeResource("offers"),
  validation(validator.changeOfferStatus),
  offerController.changeOfferStatus,
);

router.delete(
  "/:offerId",
  authentication(),
  authorizeResource("offers"),
  validation(validator.deleteOffer),
  offerController.deleteOffer,
);
export default router;
