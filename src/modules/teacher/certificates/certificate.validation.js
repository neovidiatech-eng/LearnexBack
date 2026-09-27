import joi from "joi";
import { CertificateType } from "../../../utils/Enums/teacherCertificate.enum.js";


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
    })
    .options({ allowUnknown: false }),
};


