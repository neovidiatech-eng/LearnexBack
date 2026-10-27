import { Router } from "express";
import * as certificateController from "./certificate.controller.js";
import * as certificateValidation from "./certificate.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { authorize, authorizeResource } from "../../../middleware/authorization.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { localFileUpload } from "../../../utils/multer/local.multer.js";
import { fileValidation } from "../../../utils/multer/fileValidation.js";
import { PERMISSIONS_V2 } from "../../../Constants/permissions.constants.js";

const router = Router();

router.use(authentication());

router.post(
  "/",
  authorize(PERMISSIONS_V2.CERTIFICATES.CREATE),
  localFileUpload({
    customPath: (req) => `teacher/certificates/${req.user.id}`,
    validation: [
      ...fileValidation.image,
      ...fileValidation.document.filter((type) => type === "application/pdf"),
    ],
    maxSizeInMB: 15,
  }).single("file"),
  validation(certificateValidation.createCertificate),
  certificateController.createCertificate,
);

router.get(
  "/",
  authorize(PERMISSIONS_V2.CERTIFICATES.READ),
  validation(certificateValidation.getCertificatesQuery),
  certificateController.getAllCertificates,
);

router.get(
  "/:id",
  authorize(PERMISSIONS_V2.CERTIFICATES.READ),
  validation(certificateValidation.getCertificateById),
  certificateController.getCertificateById,
);

router.delete(
  "/:id",
  authorize(PERMISSIONS_V2.CERTIFICATES.DELETE),
  validation(certificateValidation.deleteCertificate),
  certificateController.deleteCertificate,
);

export default router;

