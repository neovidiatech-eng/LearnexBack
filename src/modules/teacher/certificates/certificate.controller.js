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