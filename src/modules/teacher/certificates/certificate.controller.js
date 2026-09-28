import * as certificateService from "./certificate.service.js";
import { asyncHandler, successResponse } from "../../../utils/response.js";

export const createCertificate = asyncHandler(async (req, res) => {
  const certificate = await certificateService.createCertificateService(
    req.user.id,
    req.body,
    req.file,
  );
  return successResponse({
    res,
    status: 201,
    message: "Certificate uploaded successfully",
    data: certificate,
  });
});

export const getCertificateById = asyncHandler(async (req, res) => {
  const certificate = await certificateService.getCertificateByIdService(
    req.user.id,
    req.params.id,
  );
  return successResponse({
    res,
    data: certificate,
  });
});

export const getAllCertificates = asyncHandler(async (req, res) => {
  const certificates = await certificateService.getCertificatesService(
    req.user.id,
    req.query,
  );
  return successResponse({
    res,
    data: certificates,
  });
});

export const deleteCertificate = asyncHandler(async (req, res) => {
  await certificateService.deleteCertificateService(
    req.user.id,
    req.params.id,
  );
  return successResponse({
    res,
    message: "Certificate deleted successfully",
  });
});

