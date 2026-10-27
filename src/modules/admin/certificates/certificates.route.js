import { Router } from "express";
import { authentication } from "../../../middleware/authentication.middleware.js";
import * as certificatesController from "./certificates.controller.js";
import { authorize } from "../../../middleware/authorization.middleware.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";
import { validation } from "../../../middleware/validation.middleware.js";
import * as schema from "./certificates.validation.js";

const router = Router();

router.use(authentication());

router.get(
  "/",
  authorize(PERMISSIONS_V2.CERTIFICATES.READ),
  validation(schema.getAllCertificates),
  certificatesController.getAllCertificates,
);
router.get(
  "/:id",
  authorize(PERMISSIONS_V2.CERTIFICATES.READ),
  validation(schema.getCertificateById),
  certificatesController.getCertificatesById,
);

router.delete(
  "/:id",
  authorize(PERMISSIONS_V2.CERTIFICATES.DELETE),
  validation(schema.deleteCertificates),
  certificatesController.deleteCertificates,
);

export default router;
