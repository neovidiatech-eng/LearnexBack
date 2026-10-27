import Joi from "joi";
import { generalFields } from "../../../utils/validation/generalField.js";

const paramId = Joi.object({
  id: generalFields.id,
});

export const getAllCertificates = {
  query: Joi.object({
    page: generalFields.page,
    limit: generalFields.limit,
    search: generalFields.search,
  }),
};
export const getCertificateById = {
  params: paramId,
};
export const deleteCertificates = {
  params: paramId,
};
