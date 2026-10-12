import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import * as offerController from "./offers.controller.js";
import * as validator from "./offers.validation.js";

const router = Router();

router.use(authentication());

router.post(
  "/",
  validation(validator.createOffer),
  offerController.createOffer,
);

router.get(
  "/",
  validation(validator.getAllOffers),
  offerController.getAllOffers,
);

router.get(
  "/:offerId",
  validation(validator.getOfferById),
  offerController.getOfferById,
);

router.patch(
  "/:offerId",
  validation(validator.updateOffer),
  offerController.updateOffer,
);

router.patch(
  "/:offerId/status",
  validation(validator.changeOfferStatus),
  offerController.changeOfferStatus,
);

router.delete(
  "/:offerId",
  validation(validator.deleteOffer),
  offerController.deleteOffer,
);

export default router;
