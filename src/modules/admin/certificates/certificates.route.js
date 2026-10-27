import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import * as certificatesController from "./certificates.controller.js";
import { authorize } from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();

router.use(authentication());

router.get(
  "/",
  authorize(PERMISSIONS_V2.CERTIFICATES.READ),
  certificatesController.getAllCertificates,
);
router.get(
  "/:id",
  authorize(PERMISSIONS_V2.CERTIFICATES.READ),
  certificatesController.getCertificatesById,
);

router.delete(
  "/:id",
  authorize(PERMISSIONS_V2.CERTIFICATES.DELETE),
  certificatesController.deleteCertificates,
);

export default router;
