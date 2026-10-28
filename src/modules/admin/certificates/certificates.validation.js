import Joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";
import {
  CertificateType,
  CertificateStatus,
} from "../../../utils/Enums/teacherCertificate.enum.js";

const paramId = Joi.object({
  id: generalFields.id.required(),
});

export const getAllCertificates = {
  query: Joi.object({
    page: generalFields.page,
    limit: generalFields.limit,
    search: generalFields.search,
    type: Joi.string()
      .valid(...Object.values(CertificateType))
      .optional(),
    status: Joi.string()
      .valid(...Object.values(CertificateStatus))
      .optional(),
  }),
};
export const getCertificateById = {
  params: paramId,
};
export const deleteCertificates = {
  params: paramId,
};
