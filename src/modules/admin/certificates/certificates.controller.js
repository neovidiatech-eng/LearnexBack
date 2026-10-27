
import { asyncHandler, successResponse } from "../../../utils/response.js";
import * as certificatesService from "./certificates.service.js";

export const getAllCertificates = asyncHandler(async (req, res) => {
  const result = await certificatesService.getAllCertificatesService({
    ...req.query,
  });

  return successResponse({
    res,
    message: "CERTIFICATES_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const getCertificatesById = asyncHandler(async (req, res) => {
  const result = await certificatesService.getCertificatesByIdService(
    req.params.id,
  );

  return successResponse({
    res,
    message: "CERTIFICATE_FETCHED_SUCCESSFULLY",
    data: result,
  });
});

export const deleteCertificates = asyncHandler(async (req, res) => {
  await certificatesService.deleteCertificatesService(req.params.id);

  return successResponse({
    res,
    message: "CERTIFICATE_DELETED_SUCCESSFULLY",
    status: 200,
  });
});
