import joi from "joi";
import {
  CertificateType,
  CertificateStatus,
} from "../../../utils/Enums/teacherCertificate.enum.js";
import { generalFields } from "../../../utils/validation/generalField.js";

export const createCertificate = {
  body: joi
    .object({
      type: joi
        .string()
        .valid(...Object.values(CertificateType))
        .required(),
      title: joi.string().min(2).max(150).trim().required(),
      issuer: joi.string().min(2).max(150).trim().required(),
      issueYear: joi
        .number()
        .integer()
        .min(1950)
        .max(new Date().getFullYear())
        .required(),
    })
    .options({ allowUnknown: false }),
};

export const getCertificatesQuery = {
  query: joi
    .object({
      type: joi
        .string()
        .valid(...Object.values(CertificateType))
        .optional(),
      status: joi
        .string()
        .valid(...Object.values(CertificateStatus))
        .optional(),
      page: generalFields.page.optional(),
      limit: generalFields.limit.optional(),
    })
    .options({ allowUnknown: false }),
};

export const getCertificateById = {
  params: joi
    .object({
      id: generalFields.id.required(),
    })
    .options({ allowUnknown: false }),
};

export const deleteCertificate = {
  params: joi
    .object({
      id: generalFields.id.required(),
    })
    .options({ allowUnknown: false }),
};



