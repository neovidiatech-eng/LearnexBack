import { Router } from "express";
import * as certificateController from "./certificate.controller.js";
import * as certificateValidation from "./certificate.validation.js";
import { authentication } from "../../../middleware/authentication.middleware.js";
import { authorizeResource } from "../../../middleware/authorization.middleware.js";
import { validation } from "../../../middleware/validation.middleware.js";
import { localFileUpload } from "../../../utils/multer/local.multer.js";
import { fileValidation } from "../../../utils/multer/fileValidation.js";

const router = Router();

router.use(authentication(), authorizeResource("teachers"));

router.post(
  "/",
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
  validation(certificateValidation.getCertificatesQuery),
  certificateController.getAllCertificates,
);

router.get(
  "/:id",
  validation(certificateValidation.getCertificateById),
  certificateController.getCertificateById,
);

router.delete(
  "/:id",
  validation(certificateValidation.deleteCertificate),
  certificateController.deleteCertificate,
);

export default router;

